import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';
import {  ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponse, PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { CreateOrderDto, CreateOrderResponseDto, GetOrderDetailDto, GetOrderDTO } from './dto/orders.dto';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Ger user orders', description: 'Retrieves the user orders paginated.'})
  @ApiPaginatedResponse(GetOrderDTO)
  @ApiResponse({status:400, description: 'Bad Request'})
  @ApiResponse({status:500, description:'Internal Server Error'})
  @Auth(ValidRoles.user)
  @Get()
  async getUserOrders(  
    @GetUser() user:User,
    @Query() orderPaginationDto:OrdersPaginationDto):Promise<PaginatedResponseDTO<GetOrderDTO>>{
      return this.ordersService.getUserOrders(user,orderPaginationDto);
    }

  @ApiOperation({summary:'Ger order detail', description:'Retrieves an order detail based on the order id'})
  @HttpCode(HttpStatus.OK)
  @ApiResponse({status:HttpStatus.OK,type:GetOrderDetailDto})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description:'Unauthoriced'})
  @ApiResponse({status:HttpStatus.NOT_FOUND,description:'Order not found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR,description: 'Internal server error'})
  @Auth(ValidRoles.user)
  @Get(':id')
  async getOrderDetail(@Param('id') id:string, @GetUser() user:User):Promise<GetOrderDetailDto>{
    return this.ordersService.getOrderDetail(user, id);
  }

  @ApiOperation({summary:'Create New Order', description:'Creates a new order with PENDING status and the stripe payment intent'})
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({status:HttpStatus.CREATED, type:CreateOrderResponseDto})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED, description:'Unauthoriced'})
  @ApiResponse({status:HttpStatus.BAD_REQUEST, description:'Bad Request'})
  @ApiResponse({status:HttpStatus.NOT_FOUND,description:'Not Found'})
  @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR,description: 'Internal server error'})
  @Auth(ValidRoles.user)
  @Post('/new')
  async createOrderAndPaymentIntent(@Body() createOrderDto:CreateOrderDto, @GetUser() user:User):Promise<CreateOrderResponseDto>{
    return this.ordersService.createPayemntIntentAndOrder(user,createOrderDto);
  }
}
