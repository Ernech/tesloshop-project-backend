import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminOrdersService } from './admin-orders.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { FinancialKPIsDto } from '../dto/finantial-kpis.dto';
import { DashboardQueryDto } from '../dto/dashboard-query.dt';
import { DateIntervals } from '../enums/date-intervals.enum';
import { SalesTrendQueryParamsDto, SalesTrendsResponseDto } from '../dto/stales-trend.dto';

@ApiTags('Admin Dashboard Orders')
@Controller('admin-orders')
@Auth(ValidRoles.admin)
export class AdminOrdersController {

  constructor(private readonly adminOrdersService:AdminOrdersService){
  }

  @ApiOperation({ summary: 'Get financial Kpis', description: 'Get the financial Kpis based on a date rage'})
  @ApiResponse({status: HttpStatus.OK, type: FinancialKPIsDto })
  @ApiResponse({status: HttpStatus.BAD_REQUEST})
  @ApiResponse({status: HttpStatus.FORBIDDEN})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR})  
  @Get('dashboard/financial-kpis')
  async getFinancialKPIs(@Query() query: DashboardQueryDto): Promise<FinancialKPIsDto> {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    return this.adminOrdersService.getFinantialKPIs(start, end);
  }

  @ApiOperation({ summary: 'Get Sales trend', description: 'Get the sales trend based on a date range'})
  @ApiResponse({status: HttpStatus.OK, type: SalesTrendsResponseDto })
  @ApiResponse({status: HttpStatus.BAD_REQUEST})
  @ApiResponse({status: HttpStatus.FORBIDDEN})
  @ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR})  
  @Get('dashboard/sales-trend')
  @ApiQuery({ name: 'interval', enum: DateIntervals, required: false })
  async getSalesTrend(@Query() query: SalesTrendQueryParamsDto):Promise<SalesTrendsResponseDto> {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    return this.adminOrdersService.getSalesTrend(start, end, query.interval);
  }



}
