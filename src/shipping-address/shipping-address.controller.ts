import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, HttpStatus } from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto, CreateShippingAddressResponseDto, GetShippingAddressesResponseDTO, ShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto, UpdatedShippingAddressResponseDto } from './dto/update-shipping-address.dto';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShippingAddressOperationDto } from './dto/shipping-address-operation.dto';

@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly shippingAddressService: ShippingAddressService) {}

  @ApiOperation({ summary: 'Create shipping address', description: 'Creates a new shipping address.'})
  @ApiCreatedResponse({type:CreateShippingAddressResponseDto})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND, description: 'Not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
  @Auth()
  @Post()
  async createNewShippingAddress(@Body() createShippingAddressDto: CreateShippingAddressDto,@GetUser() user:User):Promise<CreateShippingAddressResponseDto> {
    return await this.shippingAddressService.createNewShippingAddress(user,createShippingAddressDto);
  }

  @ApiOperation({summary:'Get shipping address', description:'Retrieves all user active shipping address'})
  @ApiOkResponse({type:GetShippingAddressesResponseDTO})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND, description: 'Not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
  @Auth()  
  @Get()
  async findAllShippingAddress(@GetUser() user:User):Promise<GetShippingAddressesResponseDTO>{
    return await this.shippingAddressService.findAllUSerShippingAddress(user);
  }

  @ApiOperation({summary:'Find shipping address by id', description:'Find a shipping address by id'})
  @ApiOkResponse({type:GetShippingAddressesResponseDTO})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND, description: 'Not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
  @Auth()
  @Get(':id')
  async findOne(@Param('id',ParseUUIDPipe) id: string, @GetUser() user:User):Promise<ShippingAddressDto> {
    return await this.shippingAddressService.findShippingAddressById(user,id);
  }

  @ApiOperation({summary:'Update shipping address', description:'Updates user shipping address'})
  @ApiOkResponse({type:UpdatedShippingAddressResponseDto})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND, description: 'Not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
  @Auth()
  @Put(':id')
  async updateShippingAddress(@Param('id',ParseUUIDPipe) id: string, @GetUser() user:User,@Body() updateShippingAddressDto: UpdateShippingAddressDto):Promise<UpdatedShippingAddressResponseDto> {
    return await this.shippingAddressService.updateShippingAddress(id, user,updateShippingAddressDto);
  }

  @ApiOperation({summary:'Change default shipping address', description:'Ghanges the default shipping address'})
  @ApiOkResponse({type:ShippingAddressOperationDto})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND, description: 'Not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
  @Auth()
  @Patch(':id/set-default')
  async changeDefaultShippingAddress(@Param('id',ParseUUIDPipe) id:string, @GetUser() user:User):Promise<ShippingAddressOperationDto>{
    return await this.changeDefaultShippingAddress(id,user)
  }

  @ApiOperation({summary:'Delete shipping address', description:'Removes shipping address by id'})
  @ApiOkResponse({type:ShippingAddressOperationDto})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description: 'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND, description: 'Not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
  @Auth()
  @Delete(':id')
  async removeShippingAddress(@Param('id',ParseUUIDPipe) id: string, @GetUser() user:User):Promise<ShippingAddressOperationDto> {
    return await this.shippingAddressService.deleteShippingAddress(id,user);
  }
}
