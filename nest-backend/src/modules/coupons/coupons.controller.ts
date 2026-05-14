import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('apply')
  async apply(@Body() body: { code: string; total: number }) {
    return this.couponsService.apply(body.code, body.total);
  }

  @Get(':code')
  async get(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }
}
