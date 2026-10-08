import { Controller, DefaultValuePipe, Get, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { AdminCustomerService } from './admin-customer.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { TopCustomersDto } from './dto/top-customers.dto';
import { CustomerRetentionDto } from './dto/customer-retention.dto';

@ApiTags('Admin Dashboard Customer')
@Controller('admin/customer')
@Auth(ValidRoles.admin)
export class AdminCustomerController {
  
  constructor(private readonly adminCustomerService: AdminCustomerService) {}

  @ApiOperation({ summary: 'Get Top Customers', description: 'Get the most buyers customers'})
  @ApiResponse({status: HttpStatus.OK, type: [TopCustomersDto] })
  @ApiResponse({status: HttpStatus.BAD_REQUEST})
  @ApiResponse({status: HttpStatus.FORBIDDEN})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR})
  @Get('dashboard/top')
  async getTopCustomers(@Query('limit',new DefaultValuePipe(10),ParseIntPipe) limit:number):Promise<TopCustomersDto[]>{
    return this.adminCustomerService.getTopCustomers(limit);
  }

  @ApiOperation({ summary: 'Get Customers Retention', description: 'Get the Customers retention rate and how many have bought one time and how many have bought many times'})
  @ApiResponse({status: HttpStatus.OK, type: CustomerRetentionDto })
  @ApiResponse({status: HttpStatus.BAD_REQUEST})
  @ApiResponse({status: HttpStatus.FORBIDDEN})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR})
  @Get('dashboard/retention')
  async getCustomerRetention():Promise<CustomerRetentionDto>{
    return this.adminCustomerService.getCustomersRetention();
  }


}
