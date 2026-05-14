import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { PdfService } from './pdf.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './order.schema';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [OrdersService, PdfService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
