import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from '../../common/dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async createForUser(userId: string, dto: CreateOrderDto): Promise<{ order: Record<string, unknown> }> {
    const ids = dto.items.map((i) => i.productId);
    const products = await this.productsService.findByIds(ids);
    const byId = new Map(products.map((p: Record<string, unknown>) => [String(p._id), p]));

    let subtotal = 0;
    const items: Array<{
      productId: Types.ObjectId;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }> = [];

    for (const it of dto.items) {
      const p = byId.get(it.productId);
      const doc = p as { name?: string; price?: number; stock?: number; image?: string } | undefined;
      if (!doc) {
        throw new BadRequestException({ error: 'invalid_product' });
      }
      const stock = Number(doc.stock ?? 0);
      if (stock < it.quantity) {
        throw new BadRequestException({ error: 'out_of_stock', productId: it.productId });
      }
      subtotal += Number(doc.price) * it.quantity;
      items.push({
        productId: new Types.ObjectId(it.productId),
        name: String(doc.name),
        price: Number(doc.price),
        quantity: it.quantity,
        image: String(doc.image || ''),
      });
    }

    const totalPrice = Math.max(0, subtotal);
    const name = `${dto.shipping.firstName} ${dto.shipping.lastName}`.trim();

    const order = await new this.orderModel({
      userId: new Types.ObjectId(userId),
      items,
      totalPrice,
      status: 'pending_payment',
      paymentStatus: 'unpaid',
      shippingAddress: {
        street: dto.shipping.address,
        city: dto.shipping.city,
        state: '',
        zipCode: dto.shipping.postalCode,
        country: '',
        phone: dto.shipping.phone,
        name,
      },
    }).save();

    return { order: order.toObject({ flattenMaps: true }) as unknown as Record<string, unknown> };
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).lean();
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!order) throw new NotFoundException('Order not found');
    return order as unknown as Order;
  }

  async cancel(id: string): Promise<void> {
    const res = await this.orderModel.findByIdAndUpdate(id, { status: 'cancelled' });
    if (!res) throw new NotFoundException('Order not found');
  }

  async getDashboardStats() {
    const totalRevenue = await this.orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalOrders = await this.orderModel.countDocuments();
    
    const monthlyRevenue = await this.orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentOrders = await this.orderModel.find().sort({ createdAt: -1 }).limit(5).lean();

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      monthlyRevenue,
      recentOrders,
    };
  }
}
