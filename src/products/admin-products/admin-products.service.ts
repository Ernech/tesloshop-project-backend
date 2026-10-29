import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities';
import { Repository } from 'typeorm';
import {  DeadStockProductResponseDTO, GetTopSellersResponseDTO, LowStockProductDTO, TopSellerProductDTO } from '../dto/admin-product.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { plainToInstance } from 'class-transformer';
import { PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { Order } from 'src/orders/entities/order.entity';
import { ProductSizeStock } from '../entities/product-size-stock.entity';

@Injectable()
export class AdminProductsService {

    private readonly logger = new Logger('AdminProductsService');

    constructor(
        @InjectRepository(Product) private productsRepository: Repository<Product>,
        @InjectRepository(OrderItem) private orderItemsRepository:Repository<OrderItem>,
        @InjectRepository(ProductSizeStock) private productSizeStockRepository:Repository<ProductSizeStock>
    ){}

    async getTopBestSellingProducts(limit=10):Promise<GetTopSellersResponseDTO>{
        try {
            const rawData = await this.productsRepository.createQueryBuilder("product")
            .select([
                "product.id AS id",
                "product.title AS title",
                "product.slug AS slug",
                "product.price AS price",
                "orderItem.selectedSize AS size"
            ])
            .addSelect('SUM(orderItem.quantity)', 'unitsSold')
          
            .addSelect('SUM(orderItem.quantity * orderItem.price)', 'totalRevenue')
            .innerJoin(OrderItem, 'orderItem', 'orderItem.product_id = product.id')
            .innerJoin('orderItem.order', 'order', 'order.status = :status', { status: OrderStatus.PAID })
            .groupBy('product.id')
            .addGroupBy('orderItem.selectedSize') 
            .orderBy('unitsSold', 'DESC') 
            .limit(limit)
            .getRawMany();

        return {
            message: `Top ${limit} best-selling products by size`,
            date: new Date(),
            products: plainToInstance(TopSellerProductDTO, rawData)
        };
            

        } catch (error) {
            this.handleDBExceptions(error)
        }
        

    }

    async getLowStockAlerts(threshold:number = 5, page:number =1, limit:number=5):Promise<PaginatedResponseDTO<LowStockProductDTO>>{
        try {
            const skip = (page-1)*limit;
             const [sizeStocks, total] = await this.productSizeStockRepository.createQueryBuilder('sizeStock')
            .innerJoinAndSelect('sizeStock.product', 'product') 
            .where('sizeStock.stock <= :threshold', { threshold })
            .andWhere('product.isActive = :isActive', { isActive: true })
            .orderBy('sizeStock.stock', 'ASC') 
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            totalItems: total, 
            pageNumber: page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
            items: sizeStocks.map(variant => ({
                id: variant.product.id,
                title: variant.product.title,
                price: variant.product.price,
                slug: variant.product.slug,
                size: variant.size,  
                stock: variant.stock  
            }))
        };


        } catch (error) {
            this.handleDBExceptions(error);
        }


    }
    
    async getDeadStock(daysAgo:number=30):Promise<DeadStockProductResponseDTO>{
        try {
              const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - daysAgo);

        
        const activeVariantsQuery = this.orderItemsRepository.createQueryBuilder('orderItem')
         
            .select("CONCAT(orderItem.product_id, '_', orderItem.selected_size)")
            .innerJoin('orderItem.order', 'order') 
            .where('order.status = :status', { status: OrderStatus.PAID })
            .andWhere('order.createdAt >= :targetDate', { targetDate });

        
        const deadVariants = await this.productSizeStockRepository.createQueryBuilder('sizeStock')
            .innerJoinAndSelect('sizeStock.product', 'product') 
            .where(`CONCAT(sizeStock.product_id, '_', sizeStock.size) NOT IN (${activeVariantsQuery.getQuery()})`)
            .setParameters(activeVariantsQuery.getParameters()) // Heredamos el targetDate y status de la subconsulta
            .andWhere('product.isActive = :isActive', { isActive: true })
            .andWhere('sizeStock.stock > 0') 
            .orderBy('sizeStock.stock', 'DESC') 
            .getMany();

        return {
            message: `Getting the dead stock from the last ${daysAgo} days`,
            products: deadVariants.map(variant => ({
                id: variant.product.id,
                title: variant.product.title,
                price: variant.product.price,
                slug: variant.product.slug,
                size: variant.size,   
                stock: variant.stock  
            }))
        };


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
