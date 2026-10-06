import { Module } from '@nestjs/common';
import { AdminCustomerService } from './admin-customer.service';
import { AdminCustomerController } from './admin-customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Module({
  controllers: [AdminCustomerController],
  providers: [AdminCustomerService],
  imports:[AuthModule,TypeOrmModule.forFeature([User,Order,OrderItem])]
})
export class AdminCustomerModule {}
