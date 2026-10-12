import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminStripeService } from './admin-stripe.service';
import { QueryTransactionsDto } from '../dto/query-transactions.dto';
import { FailedTransactionDto } from '../dto/failed-transaction.dto';
import { ApiPaginatedResponse } from 'src/common/dtos/pagination-reponse.dto';

@ApiTags('Admin Dashboard Stripe')
@Controller('admin/stripe')
export class AdminStripeController {

    constructor(private readonly adminStripeServices:AdminStripeService){}


  @Get('dashboard/payments-failed')
  @ApiPaginatedResponse(FailedTransactionDto)
  @ApiResponse({status:HttpStatus.BAD_REQUEST,description:'Invalid QUery Params'})
  @ApiResponse({status: HttpStatus.FORBIDDEN})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR})  
  async getFailedPayments(@Query() queryDto: QueryTransactionsDto) {
    return this.adminStripeServices.getFailedTransactions(queryDto);
  }
}
