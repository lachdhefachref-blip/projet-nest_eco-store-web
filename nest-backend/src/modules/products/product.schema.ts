import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, text: true })
  name: string;

  @Prop({ required: true, text: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, text: true })
  category: string;

  @Prop({ text: true })
  subcategory?: string;

  @Prop({ text: true })
  brand?: string;

  @Prop({ text: true })
  color?: string;

  @Prop({ text: true })
  size?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ type: [String] })
  images?: string[];

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0, min: 0 })
  ratingsCount: number;

  @Prop({ default: 0, min: 0 })
  soldCount: number;

  @Prop()
  createdBy?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Create text index for search
ProductSchema.index({ name: 'text', category: 'text', subcategory: 'text', brand: 'text' });