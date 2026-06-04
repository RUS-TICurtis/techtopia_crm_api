import { Controller, Post, Get, Patch, Body, Req, UseGuards, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: any) {
    const user = await this.authService.validateUser(credentials.email, credentials.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials. Select a demo role below.');
    }
    return this.authService.login(user);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Req() req: any, @Body('code') code: string, @Body('tempToken') tempToken?: string) {
    const token = tempToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Temporary authentication token is missing');
    }

    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'mfa_pending') {
        throw new UnauthorizedException('Invalid token type for MFA verification');
      }
      return this.authService.verifyMfa(payload.sub, code);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired temporary authentication token');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userPayload = req.user;
    if (!userPayload) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Require MFA check
    const requireMfa = 
      userPayload.role === 'super_admin' || 
      userPayload.role === 'finance' || 
      userPayload.email.includes('admin') || 
      userPayload.email.includes('finance');

    if (requireMfa && !userPayload.mfaVerified) {
      throw new UnauthorizedException('MFA verification required');
    }

    const user = await this.authService.validateUserById(userPayload.sub);
    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

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
      mfaVerified: userPayload.mfaVerified,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() data: any) {
    const userPayload = req.user;
    if (!userPayload) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.authService.updateProfile(userPayload.sub, data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions() {
    return [
      {
        id: 's1',
        device: 'Chrome / Windows',
        ip: '192.168.1.5',
        lastActive: 'Active Now',
        isCurrent: true,
      }
    ];
  }
}
