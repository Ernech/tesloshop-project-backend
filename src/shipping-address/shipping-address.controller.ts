import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto, CreateShippingAddressResponseDto, GetShippingAddressesResponseDTO, ShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators';

@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly shippingAddressService: ShippingAddressService) {}

  @Post()
  async createNewShippingAddress(@Body() createShippingAddressDto: CreateShippingAddressDto,@GetUser() user:User):Promise<CreateShippingAddressResponseDto> {
    return await this.shippingAddressService.createNewShippingAddress(user,createShippingAddressDto);
  }

  @Get()
  async findAllShippingAddress(@GetUser() user:User):Promise<GetShippingAddressesResponseDTO>{
    return await this.shippingAddressService.findAllUSerShippingAddress(user);
  }

  @Get(':id')
  async findOne(@Param('id',ParseUUIDPipe) id: string, @GetUser() user:User):Promise<ShippingAddressDto> {
    return await this.shippingAddressService.findShippingAddressById(user,id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShippingAddressDto: UpdateShippingAddressDto) {
    return this.shippingAddressService.update(+id, updateShippingAddressDto);
  }

  @Patch(':id/set-default')
  async changeDefaultShippingAddress(@Param('id',ParseUUIDPipe) id:string, @GetUser() user:User){
    return await this.changeDefaultShippingAddress(id,user)
  }

  @Delete(':id')
  async removeShippingAddress(@Param('id',ParseUUIDPipe) id: string, @GetUser() user:User) {
    return this.shippingAddressService.deleteShippingAddress(id,user);
  }
}
