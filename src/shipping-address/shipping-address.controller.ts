import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto, CreateShippingAddressResponseDto, GetShippingAddressesResponseDTO } from './dto/create-shipping-address.dto';
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
  async findAllAhippingAddress(@GetUser() user:User):Promise<GetShippingAddressesResponseDTO>{
    return await this.shippingAddressService.findAllUSerShippingAddress(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingAddressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShippingAddressDto: UpdateShippingAddressDto) {
    return this.shippingAddressService.update(+id, updateShippingAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingAddressService.remove(+id);
  }
}
