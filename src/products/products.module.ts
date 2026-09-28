import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from './../auth/auth.module';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { Product, ProductImage } from './entities';
import { AdminProductsService } from './admin-products/admin-products.service';
import { AdminProductsController } from './admin-products/admin-products.controller';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, AdminProductsService],
  imports: [
    TypeOrmModule.forFeature([ Product, ProductImage, OrderItem ]),
    AuthModule,
  ],
  exports: [
    ProductsService,
    TypeOrmModule,
  ]
})
export class ProductsModule {}
