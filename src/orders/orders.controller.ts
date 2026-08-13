import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';
import {  ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponse, PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { GetOrderDetailDto, GetOrderDTO } from './dto/orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Ger user orders', description: 'Retrieves the user orders paginated.'})
  @ApiPaginatedResponse(GetOrderDTO)
  @ApiResponse({status:400, description: 'Bad Request'})
  @ApiResponse({status:500, description:'Internal Server Error'})
  @Auth()
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
  @Get(':id')
  async getOrderDetail(@Param('id') id:string, @GetUser() user:User):Promise<GetOrderDetailDto>{
    return this.ordersService.getOrderDetail(user, id);
  }
}
