import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';
import { Order, OrderSchema } from '../orders/order.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    OrdersModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
