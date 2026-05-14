import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  rating: number;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({ default: true })
  active: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ productId: 1, userId: 1 });
