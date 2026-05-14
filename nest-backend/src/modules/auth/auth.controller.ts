import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../../common/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return { ok: true };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('google')
  async googleLogin(@Body('token') token: string) {
    // TODO: Implement Google OAuth
    return { message: 'Google login not implemented yet' };
  }

  @Post('facebook')
  async facebookLogin(@Body('token') token: string) {
    // TODO: Implement Facebook OAuth
    return { message: 'Facebook login not implemented yet' };
  }
}