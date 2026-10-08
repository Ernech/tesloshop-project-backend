import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { TopCustomersDto } from './dto/top-customers.dto';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { CustomerRetentionDto } from './dto/customer-retention.dto';
import { Order } from 'src/orders/entities/order.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AdminCustomerService {

    private readonly logger = new Logger('AdminCustomersService');

    constructor(
        @InjectRepository(User) private readonly usersRepository:Repository<User>,
        @InjectRepository(Order) private readonly orderRepository:Repository<Order>){}

    async getTopCustomers(limit:number=10):Promise<TopCustomersDto[]>{
        try {
            const rawData = await this.usersRepository.createQueryBuilder('user')
            .select([
                'id',
                'fullName',
                'email',
                'SUM(order.total) as totalSpent',
                'COUNT(order.id) as ordersCount'
            ])
            .innerJoin('user.orders','order')
            .where('order.status=:status',{status:OrderStatus.PAID})
            .groupBy('user.id')
            .orderBy('\"totalSpent\"', 'DESC')
            .limit(limit)
            .getRawMany();
            
            return rawData.map((customer)=>({
                id:customer.id,
                fullName:customer.fullName,
                email: customer.email,
                totalSpent:customer.totalSpent,
                ordersCount:customer.ordersCount
        })); 

        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async getCustomersRetention():Promise<CustomerRetentionDto>{
        try {
            const userOrderCountRaw = await this.orderRepository.createQueryBuilder('order')
                                    .select([
                                        'order.user.id as userId',
                                        'COUNT(order.id) as paidCount'
                                    ])
                                    .where('order.status = :status',{status:OrderStatus.PAID})
                                    .groupBy('order.user.id')
                                    .getRawMany();
            let oneTimeBuyers = 0;
            let recurringBuyers = 0;

            userOrderCountRaw.forEach((item)=>{
                const count = Number(item.paidCount);
                if (count === 1) oneTimeBuyers++;
                if(count>1) recurringBuyers++;
            });

            const totalBuyers = oneTimeBuyers + recurringBuyers;
            const recurrenceRate = totalBuyers > 0 ? (recurringBuyers / totalBuyers) * 100 : 0;

            return plainToInstance(CustomerRetentionDto, {
                oneTimeBuyers,
                recurringBuyers,
                recurrenceRate
            });
                                     
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }
    
       private handleDBExceptions(error: any) {
            if (error.code === '23505') throw new BadRequestException(error.detail);
        
            this.logger.error(error);
            // console.log(error)
            throw new InternalServerErrorException(
              'Unexpected error, check server logs',
            );
          }


}
