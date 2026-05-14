import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    required: true,
  })
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  status: string; // pending, confirmed, shipped, delivered, cancelled

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
      name: String,
    },
    required: true,
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    name: string;
  };

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' })
  paymentStatus: string;

  @Prop()
  paymentMethod: string;

  @Prop()
  transactionId: string;

  @Prop()
  trackingNumber: string;

  @Prop()
  estimatedDeliveryDate: Date;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  couponId: Types.ObjectId;

  @Prop()
  discountAmount: number;

  @Prop({ default: true })
  active: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
