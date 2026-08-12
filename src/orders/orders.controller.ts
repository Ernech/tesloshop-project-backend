import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponse, PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { GetOrderDTO } from './dto/orders.dto';

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

  
}
