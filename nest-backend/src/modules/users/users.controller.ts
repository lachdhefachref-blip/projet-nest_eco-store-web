import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RegisterDto, AddressDto, CartItemDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../../common/dto';
import { User } from '../../common/interfaces';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return this.authService.login({ email: registerDto.email, password: registerDto.password });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req): Promise<User> {
    return this.usersService.getSanitizedProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() updateData: Partial<User>): Promise<User> {
    return this.usersService.updateProfile(req.user.sub, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/addresses')
  async addAddress(@Request() req, @Body() address: AddressDto): Promise<User> {
    return this.usersService.addAddress(req.user.sub, address);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/addresses/:index')
  async updateAddress(
    @Request() req,
    @Param('index', ParseIntPipe) index: number,
    @Body() address: AddressDto,
  ): Promise<User> {
    return this.usersService.updateAddress(req.user.sub, index, address);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/addresses/:index')
  async deleteAddress(
    @Request() req,
    @Param('index', ParseIntPipe) index: number,
  ): Promise<User> {
    return this.usersService.deleteAddress(req.user.sub, index);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/cart')
  async getCart(@Request() req): Promise<{ cart: any[] }> {
    const user = await this.usersService.findById(req.user.sub);
    return { cart: user?.cart || [] };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/cart')
  async addToCart(@Request() req, @Body() cartItem: CartItemDto): Promise<User> {
    return this.usersService.addToCart(req.user.sub, cartItem);
  }

  @Post('dev/set-password')
  async setPasswordDev(@Body() body: { email: string; password: string }) {
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException('Not allowed');
    }
    await this.usersService.setPasswordByEmail(body.email, body.password);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/cart/:productId')
  async updateCartItem(
    @Request() req,
    @Param('productId') productId: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<User> {
    return this.usersService.updateCartItem(req.user.sub, productId, quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/cart/:productId')
  async removeFromCart(@Request() req, @Param('productId') productId: string): Promise<User> {
    return this.usersService.removeFromCart(req.user.sub, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishlist')
  async getWishlist(@Request() req): Promise<{ wishlist: any[] }> {
    const user = await this.usersService.findById(req.user.sub);
    return { wishlist: user?.wishlist || [] };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/wishlist')
  async addToWishlist(@Request() req, @Body('productId') productId: string): Promise<User> {
    return this.usersService.addToWishlist(req.user.sub, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/wishlist/:productId')
  async removeFromWishlist(@Request() req, @Param('productId') productId: string): Promise<User> {
    return this.usersService.removeFromWishlist(req.user.sub, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    await this.usersService.changePassword(req.user.sub, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    // TODO: Implement email sending
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.usersService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return { message: 'Password reset successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/dashboard/stats')
  async getDashboardStats() {
    return this.usersService.getDashboardStats();

  }
}