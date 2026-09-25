import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities';
import { Repository } from 'typeorm';
import { GetTopSellersResponseDTO, TopSellerProductDTO } from '../dto/admin-product.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AdminProductsService {

    private readonly logger = new Logger('AdminProductsService');

    constructor(
        @InjectRepository(Product) private productsRepository: Repository<Product>
    ){}

    async getTopBestSellingProducts(limit=10):Promise<GetTopSellersResponseDTO>{
        try {
            const rawData = await this.productsRepository.createQueryBuilder("product")
            .select([
                "product.id AS id",
                "product.title AS title",
                "product.sku AS sku",
                "product.price AS price",
                "product.stock AS stok"
            ]).addSelect('SUM(orderItem.quantity)','unitsSold')
            .addSelect('SUM(orderItem.quantity*orderItem.price)','totalRevenue')
            .innerJoin('product.orderItem','orderItem')
            .innerJoin(OrderItem, 'orderItem', 'orderItem.product.id = product.id')
            .innerJoin('orderItem.order', 'order', 'order.status = :status', { status: OrderStatus.PAID })
            .groupBy('product.id')
            .orderBy('\"unitsSold\"', 'DESC') 
            .limit(limit)
            .getRawMany();

            return{
                message: `Top ${limit} best-selling produtcs`,
                date: new Date(),
                products: plainToInstance(TopSellerProductDTO,rawData)
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
