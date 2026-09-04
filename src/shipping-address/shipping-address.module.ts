import { Module } from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { ShippingAddressController } from './shipping-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';

@Module({
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  imports:[TypeOrmModule.forFeature([AddressEntity])]
})
export class ShippingAddressModule {}
