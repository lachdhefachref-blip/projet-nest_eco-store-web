import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './coupon.schema';

@Injectable()
export class CouponsService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<CouponDocument>) {}

  async findByCode(code: string): Promise<Coupon | null> {
    return this.couponModel.findOne({ code, active: true }).lean();
  }

  async create(data: Partial<Coupon>): Promise<Coupon> {
    const coupon = new this.couponModel(data);
    return coupon.save();
  }

  async apply(code: string, total: number): Promise<{ total: number; discount: number } | null> {
    const coupon = await this.couponModel.findOne({ code, active: true });
    if (!coupon) return null;
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return null;
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (coupon.amount / 100) * total;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.amount;
    }
    const newTotal = Math.max(0, total - discount);
    return { total: newTotal, discount };
  }
}
