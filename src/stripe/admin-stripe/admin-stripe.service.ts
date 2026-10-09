import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { Transaction } from 'src/orders/entities/transaction.entity';
import { Repository } from 'typeorm';
import { FailedTransactionDto } from '../dto/failed-transaction.dto';
import { QueryTransactionsDto } from '../dto/query-transactions.dto';

@Injectable()
export class AdminStripeService {

    private readonly logger = new Logger('AdminOrdersService');
    

    constructor(
        @InjectRepository(Transaction) private readonly transactionRepository:Repository<Transaction>){}

    async getFailedTransactions(queryTransactionsDTO:QueryTransactionsDto):Promise<PaginatedResponseDTO<FailedTransactionDto>>{
        try {
            
            const {page,limit} = queryTransactionsDTO;
            const skip = (page-1) * limit;
            const [transactions,total] = await this.transactionRepository.createQueryBuilder('transaction')
            .innerJoinAndSelect('transaction.order', 'order')
            .innerJoinAndSelect('order.user','user')
            .where('transaction.status = :status',{status:'payment_failed'})
            .orderBy('transaction.createdAt','DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

            const data:FailedTransactionDto[] = transactions.map((transaction)=>({
            id:transaction.id,
            stripePaymentIntentId:transaction.stripePaymentIntentId,
            orderId:transaction.order.id,
            customer:{
                id:transaction.order.user.id,
                fullName:transaction.order.user.fullName,
                email:transaction.order.user.email
            },
            createdAt:transaction.createdAt,
            orderTotal:transaction.order.total,
            failureReason: transaction.metadata['last_payment_error']['message'] || 'Generic stripe rejection',
            status:transaction.status

        })); 

        return{
            totalItems: total,
            pageSize: data.length,
            pageNumber: page,
            totalPages: Math.ceil(total / limit),
            items:data,
        }

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
