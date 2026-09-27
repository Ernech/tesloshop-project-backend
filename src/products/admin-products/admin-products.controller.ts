import { Controller, Get, Query } from '@nestjs/common';
import { RoleProtected } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { AdminProductsService } from './admin-products.service';
import { LowStockPaginationDTO } from '../dto/admin-product.dto';

@Controller('admin/products')
export class AdminProductsController {

    constructor(
        private readonly adminProductsService:AdminProductsService
    ){}


    @Get('/best-seeling')
    @RoleProtected(ValidRoles.admin)
    async getBestSellingProducts(@Query('limit') limit:number){
        return await this.adminProductsService.getTopBestSellingProducts(limit);
    }

    @Get('/low-stock')
    @RoleProtected(ValidRoles.admin)
    async getLowStockProducts(@Query() lowSotckPagination:LowStockPaginationDTO){
        return await this.adminProductsService.getLowStockAlerts(lowSotckPagination.threshold,lowSotckPagination.page,lowSotckPagination.limit)
    }

    @Get('dead-stock')
    @RoleProtected(ValidRoles.admin)
    async getDeadStockProducts(@Query('daysAgo') daysAgo:number){
        return await this.adminProductsService.getDeadStock(daysAgo)

    }

}
