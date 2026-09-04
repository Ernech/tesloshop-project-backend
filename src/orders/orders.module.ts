import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { AddressEntity } from '../shipping-address/entities/address.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports:[TypeOrmModule.forFeature([Order,OrderItem, Transaction,AddressEntity])],
  exports:[OrdersService]
})
export class OrdersModule {}
