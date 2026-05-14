import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { RegisterDto, AddressDto, CartItemDto, ChangePasswordDto } from '../../common/dto';
import { User as UserInterface } from '../../common/interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserInterface> {
    const { name, email, password, role } = registerDto as RegisterDto & { role?: string };

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new this.userModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      ...(role ? { role } : {}),
    });

    const savedUser = await user.save();
    return this.sanitizeUser(savedUser);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async getSanitizedProfile(userId: string): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<UserInterface> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async addAddress(userId: string, address: AddressDto): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.addresses = user.addresses || [];
    user.addresses.push(address);

    await user.save();
    return this.sanitizeUser(user);
  }

  async updateAddress(userId: string, addressIndex: number, address: AddressDto): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.addresses[addressIndex]) {
      throw new NotFoundException('User or address not found');
    }

    user.addresses[addressIndex] = address;
    await user.save();
    return this.sanitizeUser(user);
  }

  async deleteAddress(userId: string, addressIndex: number): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.addresses[addressIndex]) {
      throw new NotFoundException('User or address not found');
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();
    return this.sanitizeUser(user);
  }

  async addToCart(userId: string, cartItem: CartItemDto): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.cart = user.cart || [];
    const existingItem = user.cart.find(item => item.productId === cartItem.productId);

    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
    } else {
      user.cart.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        savedForLater: false,
      });
    }

    await user.save();
    return this.sanitizeUser(user);
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.cart = user.cart || [];
    const item = user.cart.find(item => item.productId === productId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = quantity;
    await user.save();
    return this.sanitizeUser(user);
  }

  async removeFromCart(userId: string, productId: string): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.cart = user.cart || [];
    user.cart = user.cart.filter(item => item.productId !== productId);

    await user.save();
    return this.sanitizeUser(user);
  }

  async addToWishlist(userId: string, productId: string): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.wishlist = user.wishlist || [];
    const existingItem = user.wishlist.find(item => item.productId === productId);

    if (!existingItem) {
      user.wishlist.push({
        productId,
        addedAt: new Date(),
      });
    }

    await user.save();
    return this.sanitizeUser(user);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.wishlist = user.wishlist || [];
    user.wishlist = user.wishlist.filter(item => item.productId !== productId);

    await user.save();
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);
    user.password = hashedPassword;
    await user.save();
  }

  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 12);
    await this.userModel.findByIdAndUpdate(userId, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({
      email: email.toLowerCase(),
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user || !user.passwordResetToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  async setPasswordByEmail(email: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
  }

  private sanitizeUser(user: UserDocument): UserInterface {
    const { password, passwordResetToken, passwordResetExpires, ...sanitizedUser } = user.toObject();
    return sanitizedUser as UserInterface;
  }

  async getDashboardStats() {
    const totalUsers = await this.userModel.countDocuments();
    const recentUsers = await this.userModel.find().sort({ createdAt: -1 }).limit(5).select('-password').lean();

    const userRolesCount = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return {
      totalUsers,
      recentUsers,
      userRolesCount,
    };

  }
}