import { Module } from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { ShippingAddressController } from './shipping-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  imports:[AuthModule,TypeOrmModule.forFeature([AddressEntity])]
})
export class ShippingAddressModule {}
