import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt-auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.register({
      secret: 'techtopia_secret_key_123_abc',
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
