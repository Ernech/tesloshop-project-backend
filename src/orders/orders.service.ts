import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { GetOrderDetailDto, GetOrderDTO } from './dto/orders.dto';
import { PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';

@Injectable()
export class OrdersService {

    constructor(@InjectRepository(Order) private readonly ordersRepository:Repository<Order>){}


    async getUserOrders(user:User, orderPaginationDto:OrdersPaginationDto):Promise<PaginatedResponseDTO<GetOrderDTO>>{
        try {
            const {limit,offset} = orderPaginationDto;
            const skip = (offset-1) *limit;
            const [orders,totalCount] = await this.ordersRepository.createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .select([
                'order.id',
                'order.total',
                'order.status',
                'order.shippingAddress',
                'order.createdAt'
            ]).orderBy('order.createdAt')
            .where('user.id = :userId', { userId:user.id })
            .skip(skip)
            .take(limit)
            .getManyAndCount();
            const totalPages = Math.ceil(totalCount / limit) || 1;

            const items: GetOrderDTO[] = orders.map(order => ({
                id: order.id,
                total: Number(order.total),
                status: order.status,
                shippingAddress: order.shippingAddress,
                orderCreationDate: order.createdAt, // maps entity createdAt to DTO orderCreationDate
                }));

          return {
            pageNumber: offset,
            pageSize: limit,
            totalPages,
            items,
            };
            
        } catch (error) {
            this.handleDBErrors(error);
        }

    }


    async GetOrderDetail(user:User, orderId:string):Promise<GetOrderDetailDto>{
        try {
           const order = await this.ordersRepository
                    .createQueryBuilder('order')
                    .innerJoin('order.user', 'user')
                    .innerJoinAndSelect('order.items', 'orderItem') 
                    .select([
                        'order.id',
                        'order.total',
                        'order.status',
                        'order.shippingAddress',
                        'order.createdAt',
                        'orderItem.productId',
                        'orderItem.productName',
                        'orderItem.quantity',
                        'orderItem.price',
                    ])
                    .where('order.id = :orderId', { orderId })
                    .andWhere('user.id = :userId', { userId: user.id })
                    .getOne();
            if(!order){
                throw new NotFoundException('Order not found');
            }
            return{
                id:order.id,
                total:order.total,
                status:order.status,
                shippingAddress:order.shippingAddress,
                orderCreationDate:order.createdAt,
                orderItems: order.items.map((orderItem)=>({
                    id:orderItem.id,
                    productName:orderItem.productName,
                    price:orderItem.price,
                    quantity:orderItem.quantity
                }))
            }
        } catch (error) {
            this.handleDBErrors(error)
        }
    }

     private handleDBErrors( error: any ): never {
    
    
        if ( error.code === '23505' ) 
          throw new BadRequestException( error.detail );
    
        console.log(error)
    
        throw new InternalServerErrorException('Please check server logs');
    
      }

}
