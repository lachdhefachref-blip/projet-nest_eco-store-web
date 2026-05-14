import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Order, OrderDocument } from '../orders/order.schema';

@Injectable()
export class PaymentsService {
  private stripe: InstanceType<typeof Stripe>;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {
    const key = this.configService.get<string>('stripe.secretKey');
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  }

  async createCheckoutSession(
    orderId: string,
    userId: string,
  ): Promise<{ url: string }> {
    console.log('[payments] createCheckoutSession request', { orderId, userId });

    const order = await this.orderModel.findById(orderId).lean();
    if (!order) {
      console.error('[payments] Order not found in DB', { orderId });
      throw new NotFoundException('Order not found');
    }

    // Ensure the order belongs to the requesting user
    if (String(order.userId) !== String(userId)) {
      console.error('[payments] Order user mismatch', {
        orderId,
        orderUserId: String(order.userId),
        jwtUserId: String(userId),
      });
      throw new NotFoundException('Order not found');
    }

    const clientUrl =
      this.configService.get<string>('clientUrl')?.replace(/\/+$/, '') ||
      'http://localhost:3000';

    try {
      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            // Stripe requires valid public HTTPS URLs for images. Removing to prevent validation crashes.
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${clientUrl}/orders?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`,
        cancel_url: `${clientUrl}/checkout`,
        metadata: {
          orderId: orderId.toString(),
          userId: userId.toString(),
        },
      });

      if (!session.url) {
        throw new BadRequestException('Failed to create Stripe Checkout session');
      }

      return { url: session.url };
    } catch (error) {
      console.error('Stripe Checkout Error:', error);
      throw new BadRequestException(error.message || 'Error communicating with Stripe');
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret || webhookSecret === 'whsec_...') {
      // Webhook secret not configured — skip in dev mode
      return;
    }

    let event: ReturnType<typeof Stripe.webhooks.constructEvent>;
    try {
      event = Stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        metadata?: { orderId?: string };
        payment_intent?: string | null;
        id: string;
      };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          isPaid: true,
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentMethod: 'stripe',
          transactionId: session.payment_intent
            ? String(session.payment_intent)
            : session.id,
        });
      }
    }
  }
}
