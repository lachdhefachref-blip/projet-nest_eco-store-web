import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    const review = await new this.reviewModel(reviewData).save();
    
    // Update product average rating
    const { avg, count } = await this.getAverage(review.productId.toString());
    await this.productsService.updateRating(review.productId.toString(), avg, count);
    
    return review;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewModel.find({ productId: new Types.ObjectId(productId), active: true }).lean();
  }

  async getAverage(productId: string): Promise<{ avg: number; count: number }> {
    const res = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId), active: true } },
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (!res || res.length === 0) return { avg: 0, count: 0 };
    return { avg: res[0].avg, count: res[0].count };
  }
}
