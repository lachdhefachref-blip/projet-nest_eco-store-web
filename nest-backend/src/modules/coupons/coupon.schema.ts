import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  type: string; // percentage | fixed

  @Prop({ required: true })
  amount: number;

  @Prop({ default: false })
  active: boolean;

  @Prop()
  expiresAt: Date;

  @Prop()
  usageLimit: number;

  @Prop()
  usedCount: number;

  @Prop()
  minOrderValue: number;

  @Prop()
  maxDiscount: number;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
// `code` is already declared as `unique: true` on the property decorator above.
// Removed duplicate index to avoid Mongoose duplicate index warning.
