import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Repository } from 'typeorm';
import { FinancialKPIsDto } from '../dto/finantial-kpis.dto';
import { OrderStatus } from '../enums/order-status.enum';

@Injectable()
export class AdminOrdersService {

      private readonly logger = new Logger('AdminOrdersService');

    constructor(@InjectRepository(Order) private orderRepository:Repository<Order>){
    }


    async getFinantialKPIs(startDate:Date, endDate:Date):Promise<FinancialKPIsDto>{
        try {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23,59,59,999);
            const financialRaw = await this.orderRepository.createQueryBuilder('order')
            .select([
                'SUM(order.total) as totalrevenue',
                'AVG(order.total) as averageTicket',
                'COUNT(order.id) as successfulOrderCount'
            ])
            .where('order.status =:status',{status: OrderStatus.PAID})
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate',{startDate,endDate:endOfDay})
            .getRawOne();

            //Rate of Orders state transition to PAID (total orders with status PAID agains total orders between the time range)
            const conversionRaw = await this.orderRepository.createQueryBuilder('order')
            .select([
                'COUNT(order.id) as totalOrdersCreated',
                'COUNT (CASE WHEN order.status = \'PAID\' THEN 1) as paidOrdersCount'
            ])
            .where('order.createdAt BETWEEN :startDate AND :endDate',{startDate,endDate:endOfDay})
            .getRawOne()

            const totalCreated = Number(conversionRaw?.totalOrdersCreated || 0)
            const totalPaidOrders = Number(conversionRaw?.paidOrdersCount || 0)
            const conversionRate = totalCreated >0? (totalPaidOrders / totalCreated) * 100 :0

            return {
                averageTicket: financialRaw?.averageTicket ?? 0,
                conversionRate:conversionRate,
                successfulOrdersCount:financialRaw?.successfulOrderCount ?? 0,
                totalRevenue: financialRaw?.totalrevenue ?? 0.00
            }
            

        } catch (error) {
            this.handleDBExceptions(error)
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
