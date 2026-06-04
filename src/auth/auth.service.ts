import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count > 0) {
      return;
    }

    const DEMO_USERS = [
      {
        email: 'admin@techtopia.crm',
        name: 'Curtis Tungsten',
        role: 'super_admin',
        roleLabel: 'Super Admin',
        avatar: 'CT',
        department: 'Executive',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        password: 'password123',
      },
      {
        email: 'sales@techtopia.crm',
        name: 'Sarah Jenkins',
        role: 'sales',
        roleLabel: 'Sales Executive',
        avatar: 'SJ',
        department: 'Sales',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        password: 'password123',
      },
      {
        email: 'support@techtopia.crm',
        name: 'Sam Porter',
        role: 'support',
        roleLabel: 'Support Agent',
        avatar: 'SP',
        department: 'Support',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        password: 'password123',
      },
      {
        email: 'finance@techtopia.crm',
        name: 'Faye Morgan',
        role: 'finance',
        roleLabel: 'Finance Manager',
        avatar: 'FM',
        department: 'Finance',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        password: 'password123',
      },
      {
        email: 'pm@techtopia.crm',
        name: 'Patrick Mills',
        role: 'project_manager',
        roleLabel: 'Project Manager',
        avatar: 'PM',
        department: 'Delivery',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        password: 'password123',
      },
      {
        email: 'client@acme.com',
        name: 'Alex Client',
        role: 'client',
        roleLabel: 'Client',
        avatar: 'AC',
        department: 'External',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        clientCompany: 'ACME Corp',
        password: 'password123',
      },
    ];

    for (const demo of DEMO_USERS) {
      const passwordHash = await bcrypt.hash(demo.password, 10);
      const user = this.userRepository.create({
        email: demo.email,
        name: demo.name,
        role: demo.role,
        roleLabel: demo.roleLabel,
        avatar: demo.avatar,
        department: demo.department,
        tenantId: demo.tenantId,
        clientCompany: demo.clientCompany || null,
        passwordHash,
        mfaSecret: 'verification_secret_key_placeholder',
      });
      await this.userRepository.save(user);
    }
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        return user;
      }
    }
    return null;
  }

  async validateUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async login(user: User) {
    // Determine if MFA is required: admin or finance
    const requireMfa = user.email.includes('admin') || user.email.includes('finance') || user.role === 'super_admin' || user.role === 'finance';
    
    if (requireMfa) {
      const payload = { sub: user.id, type: 'mfa_pending' };
      const tempToken = this.jwtService.sign(payload, { expiresIn: '5m' });
      return {
        mfaRequired: true,
        tempToken,
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          roleLabel: user.roleLabel,
          avatar: user.avatar,
          department: user.department,
          tenantId: user.tenantId,
          clientCompany: user.clientCompany,
        },
      };
    }

    return {
      mfaRequired: false,
      ...(await this.generateTokens(user, true)),
    };
  }

  async verifyMfa(userId: number, code: string) {
    // Standard bypass codes for premium development and demo ease
    if (code === '123456' || code === '000000') {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokens(user, true);
    }
    throw new UnauthorizedException('Invalid verification code. Use demo code 123456.');
  }

  async generateTokens(user: User, mfaVerified: boolean) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role, 
      mfaVerified 
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        roleLabel: user.roleLabel,
        avatar: user.avatar,
        department: user.department,
        tenantId: user.tenantId,
        clientCompany: user.clientCompany,
        phone: user.phone,
        location: user.location,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokens(user, payload.mfaVerified);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateProfile(userId: number, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.location !== undefined) user.location = data.location;
    if (data.username !== undefined) user.username = data.username;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

    await this.userRepository.save(user);

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: user.roleLabel,
      avatar: user.avatar,
      department: user.department,
      tenantId: user.tenantId,
      clientCompany: user.clientCompany,
      phone: user.phone,
      location: user.location,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }
}
