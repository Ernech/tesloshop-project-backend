import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getUserOrders(  
    @GetUser() user:User,
    @Query() orderPaginationDto:OrdersPaginationDto){
      return this.ordersService.getUserOrders(user,orderPaginationDto);
    }
}
