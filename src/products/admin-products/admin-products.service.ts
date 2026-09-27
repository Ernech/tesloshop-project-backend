import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities';
import { Repository } from 'typeorm';
import { DeadStockProductDTO, GetTopSellersResponseDTO, LowStockProductDTO, TopSellerProductDTO } from '../dto/admin-product.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { plainToInstance } from 'class-transformer';
import { PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class AdminProductsService {

    private readonly logger = new Logger('AdminProductsService');

    constructor(
        @InjectRepository(Product) private productsRepository: Repository<Product>,
        @InjectRepository(OrderItem) private orderItemsRepository:Repository<OrderItem>
    ){}

    async getTopBestSellingProducts(limit=10):Promise<GetTopSellersResponseDTO>{
        try {
            const rawData = await this.productsRepository.createQueryBuilder("product")
            .select([
                "product.id AS id",
                "product.title AS title",
                "product.slug AS slug",
                "product.price AS price",
                "product.stock AS stok"
            ]).addSelect('SUM(orderItem.quantity)','unitsSold')
            .addSelect('SUM(orderItem.quantity*orderItem.price)','totalRevenue')
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

    async getLowStockAlerts(threshold:number = 5, page:number =1, limit:number=5):Promise<PaginatedResponseDTO<LowStockProductDTO>>{
        try {
            const skip = (page-1)*limit;
            const [products,total] = await this.productsRepository.createQueryBuilder('product')
            .where('product.stock<=:threshold',{threshold})
            .andWhere('product.isActive=:isActive',{isActive:true})
            .orderBy('product.stock','ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

            return{
                totalItems:products.length,
                pageNumber:page,
                pageSize:limit,
                totalPages: Math.ceil(total / limit),
                items:products.map(product=>({
                    id:product.id,
                    title:product.title,
                    price:product.price,
                    slug:product.slug,
                    stock:product.stock
                }))
            }


        } catch (error) {
            this.handleDBExceptions(error);
        }


    }
    
    async getDeadStock(daysAgo:number=30):Promise<DeadStockProductDTO[]>{
        try {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate()-daysAgo);

            const activeProductsQuery = await this.orderItemsRepository.createQueryBuilder('orderItem')
            .select("DISTINCT orderItem.product.id")
            .innerJoin(Order,'order','order.id = orderItem.order.id')
            .where('order.status = :status',{status:OrderStatus.PAID})
            .andWhere('order.createdAt>=targetDate',{targetDate})

            //Bring those products that are not listed inthe previous sub query

            const deadStockProducts = await this.productsRepository.createQueryBuilder('product')
            .where(`product.id NOT IN (${activeProductsQuery.getQuery()})`)
            .setParameters(activeProductsQuery.getParameters())
            .andWhere('product.isActive =:isActive',{isActive:true})
            .orderBy('product.stock','DESC')
            .getMany();
            
            return deadStockProducts.map(product=>({
                     id:product.id,
                    title:product.title,
                    price:product.price,
                    slug:product.slug,
                    stock:product.stock
                }
            ));


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
