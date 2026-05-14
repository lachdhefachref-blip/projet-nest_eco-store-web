import { Controller, Post, Body, UseGuards, Get, Param, Req, Put, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateOrderDto } from '../../common/dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pdfService: PdfService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: { user: { sub: string } }, @Body() body: CreateOrderDto) {
    return this.ordersService.createForUser(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async myOrders(@Req() req: { user: { sub: string } }) {
    const orders = await this.ordersService.findByUser(req.user.sub);
    return { orders };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myOrdersExpressAlias(@Req() req: { user: { sub: string } }) {
    const orders = await this.ordersService.findByUser(req.user.sub);
    return { orders };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/dashboard/stats')
  async getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const order = await this.ordersService.findById(id);
    if (!order) return res.status(404).send('Order not found');
    try {
      const pdfBuffer = await this.pdfService.generateOrderInvoice(order);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=facture-${id.slice(-6)}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (err) {
      console.error('Error generating invoice PDF for order', id, err);
      return res.status(500).json({ message: 'Failed to generate invoice', error: String(err) });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
