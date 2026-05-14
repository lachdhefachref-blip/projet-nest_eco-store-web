import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsEnum, IsArray, ValidateNested, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(40)
  phone: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  address: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  postalCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password: string;

  @IsOptional()
  @IsEnum(['customer', 'admin'])
  role?: 'customer' | 'admin';

  @IsOptional()
  @IsString()
  @MinLength(6)
  adminCode?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(200)
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  token: string;

  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password: string;
}

export class CartItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  shipping: AddressDto;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  couponCode?: string;
}

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  comment: string;
}

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @IsEnum(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsNumber()
  @Min(1)
  maxUses: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTotal?: number;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'])
  status: 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}