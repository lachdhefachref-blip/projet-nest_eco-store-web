import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Create a Stripe Checkout Session and return the hosted payment URL. */
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(
    @Req() req: { user: { sub: string } },
    @Body() body: { orderId: string },
  ) {
    return this.paymentsService.createCheckoutSession(body.orderId, req.user.sub);
  }

  /** Stripe webhook — no JWT guard, raw body required for signature verification. */
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: true };
    }
    await this.paymentsService.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
