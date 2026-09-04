import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { Repository } from 'typeorm';
import { AddressEntity } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ShippingAddressService {

  constructor(@InjectRepository(AddressEntity) private readonly addressRepository:Repository<AddressEntity>,){}

  async createNewShippingAddress(user:User,createShippingAddressDto: CreateShippingAddressDto) {
    return 'This action adds a new shippingAddress';
  }

  findAll() {
    return `This action returns all shippingAddress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shippingAddress`;
  }

  update(id: number, updateShippingAddressDto: UpdateShippingAddressDto) {
    return `This action updates a #${id} shippingAddress`;
  }

  remove(id: number) {
    return `This action removes a #${id} shippingAddress`;
  }

   private handleDBErrors( error: any ): never {
          
    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );
    console.log(error)
    throw new InternalServerErrorException('Please check server logs');
      
  }
}
