import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { TopCustomersDto } from './dto/top-customers.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';

@Injectable()
export class AdminCustomerService {

    private readonly logger = new Logger('AdminCustomersService');

    constructor(@InjectRepository(User) private readonly usersRepository:Repository<User>){}

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
    
       private handleDBExceptions(error: any) {
            if (error.code === '23505') throw new BadRequestException(error.detail);
        
            this.logger.error(error);
            // console.log(error)
            throw new InternalServerErrorException(
              'Unexpected error, check server logs',
            );
          }


}
