import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { AdminProductsService } from './admin-products.service';
import { DeadStockProductResponseDTO, GetTopSellersResponseDTO, LowStockPaginationDTO, LowStockProductDTO } from '../dto/admin-product.dto';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse, PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';

@ApiTags('Admin Dashboard Products')
@Controller('admin/products')
export class AdminProductsController {

    constructor(
        private readonly adminProductsService:AdminProductsService
    ){}

    @ApiOperation({ summary: 'Best selling products', description: 'Gets the top [limit] best selling products'})
    @ApiOkResponse({type:GetTopSellersResponseDTO})
    @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
    @Get('/best-seeling')
    @Auth(ValidRoles.admin)
    async getBestSellingProducts(@Query('limit') limit:number):Promise<GetTopSellersResponseDTO>{
        return await this.adminProductsService.getTopBestSellingProducts(limit);
    }

    @ApiOperation({ summary: 'Low Stock Products', description: 'Get the products with the lowest stock'})
    @ApiPaginatedResponse(LowStockProductDTO)
    @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
    @Get('/low-stock')
    @Auth(ValidRoles.admin)
    async getLowStockProducts(@Query() lowSotckPagination:LowStockPaginationDTO):Promise<PaginatedResponseDTO<LowStockProductDTO>>{
        return await this.adminProductsService.getLowStockAlerts(lowSotckPagination.threshold,lowSotckPagination.page,lowSotckPagination.limit)
    }

    @ApiOperation({ summary: 'Get dead stock products', description: 'Gett he products with thw lowest sells over the last [daysAgo] days'})
    @ApiPaginatedResponse(LowStockProductDTO)
    @ApiResponse({status:HttpStatus.INTERNAL_SERVER_ERROR, description:'Internal Server Error'})
    @Get('/dead-stock')
    @Auth(ValidRoles.admin)
    async getDeadStockProducts(@Query('daysAgo') daysAgo:number):Promise<DeadStockProductResponseDTO>{
        return await this.adminProductsService.getDeadStock(daysAgo);

    }

}
