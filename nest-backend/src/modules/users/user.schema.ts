import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['customer', 'admin'], default: 'customer' })
  role: string;

  @Prop({ type: [{ type: Object }] })
  addresses: Array<{
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    isDefault?: boolean;
  }>;

  @Prop({ type: [{ type: Object }] })
  cart: Array<{
    productId: string;
    quantity: number;
    savedForLater: boolean;
  }>;

  @Prop({ type: [{ type: Object }] })
  wishlist: Array<{
    productId: string;
    addedAt: Date;
  }>;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);