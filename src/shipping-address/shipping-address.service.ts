import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateShippingAddressDto, CreateShippingAddressResponseDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { Repository } from 'typeorm';
import { AddressEntity } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ShippingAddressService {

  constructor(@InjectRepository(AddressEntity) private readonly addressRepository:Repository<AddressEntity>,){}

  async createNewShippingAddress(user:User,createShippingAddressDto: CreateShippingAddressDto):Promise<CreateShippingAddressResponseDto> {
    try {
      //Check if there is a shipping address already set as default
      let isNewAddressDefault = false;
      const adressCount = await this.addressRepository.count({where:{isActive:true, isDefault:true,user:{id:user.id}}})
      if(adressCount<1){
        //There's no address sert as default
        isNewAddressDefault = true;
      }
      //Create the new address
      const newShippingAddress = await this.addressRepository.create({
        streetAddress:createShippingAddressDto.streetAddress,
        city:createShippingAddressDto.city,
        state:createShippingAddressDto.state,
        country:createShippingAddressDto.country,
        postalCode:createShippingAddressDto.postalCode,
        user:user,
        isDefault:isNewAddressDefault
      });

      //Insert the new shipping address
      await this.addressRepository.save(newShippingAddress);
      //Return the shipping adress created
      return {
        message:"Shipping address created.",
        shippingAddress:{
          id:newShippingAddress.id,
          streetAddress:newShippingAddress.streetAddress,
          city:newShippingAddress.city,
          country:newShippingAddress.country,
          postalCode:newShippingAddress.postalCode,
          state:newShippingAddress.state,
          isDefault:newShippingAddress.isDefault
        }
      }


    } catch (error) {
      this.handleDBErrors(error);
    };
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
