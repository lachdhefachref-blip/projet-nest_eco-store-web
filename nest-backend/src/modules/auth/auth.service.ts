import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from '../../common/dto';
import { JwtPayload } from '../../common/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (!password || !user.password) {
      // either client didn't provide a password or the user has no local password (OAuth-only)
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(loginDto: LoginDto): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    } as any);

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    if (dto.role === 'admin') {
      const adminCode = this.configService.get<string>('ADMIN_REGISTRATION_CODE');
      if (!adminCode) {
        throw new BadRequestException('Admin registration is disabled');
      }
      if (!dto.adminCode || dto.adminCode !== adminCode) {
        throw new BadRequestException('Invalid admin registration code');
      }
    }

    await this.usersService.create(dto);
    return this.login({ email: dto.email, password: dto.password });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.isBlocked) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const nextRefresh = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      } as any);

      return { accessToken, refreshToken: nextRefresh };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(profile: any): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    // TODO: Implement Google OAuth
    throw new BadRequestException('Google login not implemented yet');
  }

  async facebookLogin(profile: any): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    // TODO: Implement Facebook OAuth
    throw new BadRequestException('Facebook login not implemented yet');
  }
}