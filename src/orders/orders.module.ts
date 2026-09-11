import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { AddressEntity } from '../shipping-address/entities/address.entity';
import { Transaction } from './entities/transaction.entity';
import { StripeModule } from 'src/stripe/stripe.module';
import { Product } from 'src/products/entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports:[AuthModule,TypeOrmModule.forFeature([Order,OrderItem, Product,Transaction,AddressEntity]),forwardRef(() => StripeModule)],
  exports:[OrdersService]
})
export class OrdersModule {}
