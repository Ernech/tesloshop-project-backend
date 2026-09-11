import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateShippingAddressDto, CreateShippingAddressResponseDto, GetShippingAddressesResponseDTO, ShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto, UpdatedShippingAddressResponseDto } from './dto/update-shipping-address.dto';
import { Repository, DataSource } from 'typeorm';
import { AddressEntity } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ShippingAddressOperationDto } from './dto/shipping-address-operation.dto';

@Injectable()
export class ShippingAddressService {

  constructor(@InjectRepository(AddressEntity) private readonly addressRepository:Repository<AddressEntity>,private datasource:DataSource){}

  async createNewShippingAddress(user:User,createShippingAddressDto: CreateShippingAddressDto):Promise<CreateShippingAddressResponseDto> {
    try {
      //Check if user overpass the max limit shipping addresses
      const MAX_SHIPPING_ADDRESS=10;
      const adressCount = await this.addressRepository.count({where:{isActive:true,user:{id:user.id}}});
      if(adressCount>=MAX_SHIPPING_ADDRESS){
        throw new BadRequestException(`You have reached the maximun shipping addresses (${MAX_SHIPPING_ADDRESS})`)
      }
      //Check if there is a shipping address already set as default
      let isNewAddressDefault = false;
      const defaultAddressCount = await this.addressRepository.count({where:{isActive:true, isDefault:true,user:{id:user.id}}})
      if(defaultAddressCount<1){
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

 async findAllUSerShippingAddress(user:User):Promise<GetShippingAddressesResponseDTO> {
    try {
      const [shippingAddresses,count] = await this.addressRepository.findAndCount({
        where: {
          isActive:true,
          user:{id:user.id}
        },
        order:{isDefault:'DESC', createdAt:'DESC'}
      });

      return {
        totalShippingAddress:count,
        shippingAddresses:shippingAddresses.map(shippingAddress=>({
          id:shippingAddress.id,
          streetAddress:shippingAddress.streetAddress,
          city:shippingAddress.city,
          country:shippingAddress.country,
          postalCode:shippingAddress.postalCode,
          state:shippingAddress.state,
          isDefault:shippingAddress.isDefault
        }))
      }

      
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

 async findShippingAddressById(user:User,id: string):Promise<ShippingAddressDto> {
    try {
      const shppingAddress = await this.addressRepository.findOneBy({id,isActive:true,user:{id:user.id}});
      if(!shppingAddress){
        throw new NotFoundException("Shipping address not found.");
      }
      return{
        id:shppingAddress.id,
        city:shppingAddress.city,
        country:shppingAddress.country,
        state:shppingAddress.state,
        streetAddress:shppingAddress.streetAddress,
        postalCode:shppingAddress.postalCode,
        isDefault:shppingAddress.isDefault
      }
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async changeDefualtShippingAddress(id:string, user:User):Promise<ShippingAddressOperationDto>{
    return await this.datasource.transaction(async(manager)=>{
      //Check if the new default shipping address exists
      const newDefaultShippingAddress = await manager.findOne(AddressEntity,
        {
          where: 
          {
            id,
            isActive:true,
            user:{id:user.id}
          }
        });

      if(!newDefaultShippingAddress){
        throw new NotFoundException("The shipping address does not exists")
      }
      //Check if the shipping address is already set as default
      if(newDefaultShippingAddress.isDefault){
        throw new BadRequestException("The shipping address is already set as default");
      } 
      //Find the old default shipping address
      const oldDefaultSHippingAddress = await manager.findOne(AddressEntity, {
        where:{
          isDefault:true,isActive:true, user:{
            id:user.id
          }
        }
      }) 
      if(oldDefaultSHippingAddress){
        oldDefaultSHippingAddress.isDefault=false;
        await manager.save(AddressEntity,oldDefaultSHippingAddress);
      }
      //Set the new default shipping address
      newDefaultShippingAddress.isDefault=false;
      await manager.save(AddressEntity,newDefaultShippingAddress);
      return {message:"The new defaul shipping address has been successfully set"};
    });
  }

  async updateShippingAddress(id: string,user:User, updateShippingAddressDto: UpdateShippingAddressDto):Promise<UpdatedShippingAddressResponseDto> {
    try {
      const shppingAddress = await this.addressRepository.findOneBy({id,isActive:true,user:{id:user.id}});
      if(!shppingAddress){
        throw new NotFoundException("Shipping address not found.");
      }
      const updatedShippingAddress=this.addressRepository.merge(shppingAddress,updateShippingAddressDto);
      await this.addressRepository.save(updateShippingAddressDto);
      return{
        message:"Shipping address updated",
        shippingAddress:{
          id:updatedShippingAddress.id,
          city:updatedShippingAddress.city,
          country:updatedShippingAddress.country,
          state:updatedShippingAddress.state,
          postalCode:updatedShippingAddress.postalCode,
          streetAddress:updatedShippingAddress.streetAddress,
          isDefault:updatedShippingAddress.isDefault
        }
      }

    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async deleteShippingAddress(id: string, user:User):Promise<ShippingAddressOperationDto> {

  return await this.datasource.transaction(async (manager)=>{
    const addressToDelete = await manager.findOne(AddressEntity,{
      where:
        {id,
          isActive:true,
          user:
          {
            id:user.id
          }
        }
      });
      if(!addressToDelete){
        throw new NotFoundException("The shipping address was not found");
      }
      const wasDefault = addressToDelete.isDefault;
      addressToDelete.isActive=false;
      addressToDelete.isDefault = false;
      await manager.save(AddressEntity,addressToDelete);
      if(wasDefault){
        //Find the newest shipping address and set it as default
        const newDefaultShippingAddress = await manager.findOne(AddressEntity,{
          where:{isActive:true},
          order:{
            createdAt:'DESC'
          }
        });
        if(newDefaultShippingAddress){
          newDefaultShippingAddress.isDefault=true;
          await manager.save(AddressEntity,newDefaultShippingAddress);
        }
      }
      return {message:"The shipping address was succesfully deleted"};
    });
    
  }

   private handleDBErrors( error: any ): never {
          
    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );
    console.log(error)
    throw new InternalServerErrorException('Please check server logs');
      
  }
}
