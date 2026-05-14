import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { Product as ProductInterface } from '../../common/interfaces';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(productData: Partial<Product>): Promise<any> {
    const product = new this.productModel(productData);
    return product.save().then(doc => doc.toObject());
  }

  async findAll(query: any = {}): Promise<any[]> {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      brand,
      color,
      size,
      minPrice,
      maxPrice,
      minRating,
      sort = 'createdAt',
      order = 'desc',
      search,
    } = query;

    const filter: any = { active: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;
    if (color) filter.color = color;
    if (size) filter.size = size;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };

    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions: any = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    return this.productModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .exec();
  }

  async findById(id: string): Promise<any | null> {
    return this.productModel.findById(id);
  }

  async findByIds(ids: string[]): Promise<any[]> {
    return this.productModel.find({ _id: { $in: ids }, active: true });
  }

  async update(id: string, updateData: Partial<Product>): Promise<any> {
    const product = await this.productModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  async getFilters(): Promise<{
    categories: string[];
    subcategories: string[];
    brands: string[];
    colors: string[];
    sizes: string[];
  }> {
    const categories = await this.productModel.distinct('category', { active: true });
    const subcategories = await this.productModel.distinct('subcategory', { active: true });
    const brands = await this.productModel.distinct('brand', { active: true });
    const colors = await this.productModel.distinct('color', { active: true });
    const sizes = await this.productModel.distinct('size', { active: true });

    return {
      categories,
      subcategories,
      brands,
      colors,
      sizes,
    };
  }

  async updateRating(productId: string, rating: number, count: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      rating: Math.round(rating * 10) / 10,
      ratingsCount: count,
    });
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity, soldCount: quantity },
    });
  }
}