import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, In, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { CreateOrderDto, CreateOrderResponseDto, GetOrderDetailDto, GetOrderDTO } from './dto/orders.dto';
import { PaginatedResponseDTO } from 'src/common/dtos/pagination-reponse.dto';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';
import Stripe from 'stripe';
import { Product } from 'src/products/entities';
import { AddressEntity } from '../shipping-address/entities/address.entity';
import { OrderItem } from './entities/order-item.entity';
import { CurrenciesEnum } from './enums/currencies.enum';
import { Transaction } from './entities/transaction.entity';
import { OrderStatus } from './enums/order-status.enum';
import { STRIPE_CLIENT } from 'src/stripe/stripe.constants';

@Injectable()
export class OrdersService {

    constructor(
        @InjectRepository(Order) private readonly ordersRepository:Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItemRepository:Repository<OrderItem>,
        @InjectRepository(Product) private readonly productRepository:Repository<Product>,
        @InjectRepository(AddressEntity) private readonly addressRepository:Repository<AddressEntity>,
        @InjectRepository(Transaction) private readonly transactionRepository:Repository<Transaction>,
        private dataSource: DataSource,
        @Inject(STRIPE_CLIENT) private readonly stripe:Stripe
    ){}

    async createPayemntIntentAndOrder(user:User,createOrderDto:CreateOrderDto):Promise<CreateOrderResponseDto>{
        try {
            //Validate user address
            const shippingAddress = await this.addressRepository.createQueryBuilder('shippingAddress')
            .innerJoin('shippingAddress.user','user')
            .select()
            .where('shippingAddress.id = :id',{id:createOrderDto.shippingAddressId})
            .andWhere('shippingAddress.isActive = :isActive',{isActive:true})
            .andWhere("user.id = :userId",{userId:user.id})
            .getOne();
            if(!shippingAddress){
                throw new NotFoundException("Shipping address not found");
            }
            //Check products existance
            const productsId = createOrderDto.items.map((item)=>item.productId);
            const products = await this.productRepository.find({where:{id: In(productsId)}})
            if(products.length!==createOrderDto.items.length){
                const foundProductsIds = products.map((product)=>product.id);
                const nonExistingProductsId = productsId.filter((productsId)=>!foundProductsIds.includes(productsId));
                throw new NotFoundException(`The following products: ${nonExistingProductsId} does not exists`);
            }

            let totalAmountInCents = 0;
            const orderItems:OrderItem[]=[];
            //Check products stock
            for(const orderItem of createOrderDto.items){
                const dbProduct = products.find((product)=>product.id===orderItem.productId);
                if(dbProduct.stock<orderItem.quantity){
                    throw new BadRequestException(`Insufficient stock for the product: '${dbProduct.description}'. Available: ${dbProduct.stock}, Requested: ${orderItem.quantity}`);
                }
                const priceInCents = Math.round(Number(dbProduct.price) * 100);
                totalAmountInCents += priceInCents * orderItem.quantity;
                let newOrderItem = this.orderItemRepository.create({
                    productName:dbProduct.description,
                    price:dbProduct.price,
                    quantity:orderItem.quantity
                });
                orderItems.push(newOrderItem);
            }

            //Validate order number existance
            let orderNumberExists=true;
            let newOrderNumber ='';
            while(orderNumberExists){
                let generatedOrderNumber = this.generateOrderNumber();
                let order = await this.ordersRepository.findOne({where:{orderNumber:generatedOrderNumber}});
                if(!order){
                    orderNumberExists=false;
                    newOrderNumber = generatedOrderNumber;
                }
            }
            //Create a new order with PENDING status 
            const newOrder = this.ordersRepository.create({
                orderNumber:newOrderNumber,
                total: totalAmountInCents/100,
                shippingAddress:{
                    streetAddress: shippingAddress.streetAddress,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postalCode:shippingAddress.postalCode,
                    country:shippingAddress.country
                },
                items:orderItems,
                user:user
            });
            await this.ordersRepository.save(newOrder);
            //Create a stripe payment intent
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount:totalAmountInCents,
                currency:CurrenciesEnum.USD,
                payment_method_types:['card'],
                metadata:{
                    orderId:newOrder.id,
                    userId:user.id
                }
            });
            //Update order with stripe transaction
            const newTransaction = this.transactionRepository.create({
                stripePaymentIntentId:paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                customerId: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
                paymentMethodId: typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : null,
                latestChargeId: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
                metadata: paymentIntent.metadata || {},

            });
            newOrder.transactions.push(newTransaction);
            await this.ordersRepository.save(newOrder);
            return {
                orderId:newOrder.id,
                clientSecret:paymentIntent.client_secret,
                paymentIntentId:paymentIntent.id
            }
        } catch (error) {
            this.handleDBErrors(error);
        }
    }
    //TODO: Ajustar query builder para la dirección de envío
    async getUserOrders(user:User, orderPaginationDto:OrdersPaginationDto):Promise<PaginatedResponseDTO<GetOrderDTO>>{
        try {
            const {limit,offset} = orderPaginationDto;
            const skip = (offset-1) *limit;
            const [orders,totalCount] = await this.ordersRepository.createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .select([
                'order.id',
                'order.orderNumber',
                'order.total',
                'order.status',
                'order.shippingAddress',
                'order.createdAt'
            ]).orderBy('order.createdAt')
            .where('user.id = :userId', { userId:user.id })
            .skip(skip)
            .take(limit)
            .getManyAndCount();
            const totalPages = Math.ceil(totalCount / limit) || 1;

            const items: GetOrderDTO[] = orders.map(order => ({
                id: order.id,
                total: Number(order.total),
                status: order.status,
                shippingAddress: order.shippingAddress,
                orderCreationDate: order.createdAt, // maps entity createdAt to DTO orderCreationDate
                }));

          return {
            pageNumber: offset,
            pageSize: limit,
            totalPages,
            items,
            };
            
        } catch (error) {
            this.handleDBErrors(error);
        }

    }

    async fulfillOrder(paymentIntentId:string){
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //Check if the order exists 
             const order = await queryRunner.manager.createQueryBuilder(Order,'order')
             .innerJoinAndSelect('order.items','orderItem')
             .innerJoin('order.transactions','transaction')
             .select([
                        'order.id',
                        'order.orderNumber',
                        'order.total',
                        'order.status',
                        'order.shippingAddress',
                        'order.createdAt'
            ])
            .where('transaction.stripePaymentIntentId=:paymentIntentId',{paymentIntentId})
            .getOne();
             if(!order){
                throw new NotFoundException(`The order "${order.id}" does not exists`)
             }
             if(order.status==OrderStatus.PAID){
                //Prevent to process a payment twice
                await queryRunner.rollbackTransaction();
                return;
             }
             //Check the orderItems
             const items:OrderItem[] = order.items;
             //Validate stock
             for(const item of items){
                const dbProduct = await queryRunner.manager.findOne(Product,{
                    where:{ id:item.id },
                    lock:{mode:'pessimistic_write'}
                })
                if(!dbProduct){
                    throw new NotFoundException(`The product ${item.productName} does not exists.`);
                }
                if(dbProduct.stock<item.quantity){
                    throw new NotFoundException(`Insuficient stock for the product ${dbProduct.description}. Available ${dbProduct.stock}`)
                }
                //Discount stock
                dbProduct.stock-=item.quantity;
                await queryRunner.manager.save(Product,dbProduct);
                //Update order status
            }
            order.status=OrderStatus.PAID;
            await queryRunner.manager.save(Order,order)
            await queryRunner.commitTransaction();

        } catch (error) {
             console.error('Error proccesing order, rolling back changes...', error);
            await queryRunner.rollbackTransaction();
            this.handleDBErrors(error);
        }
        finally{
            await queryRunner.release();
        }

    }

    //TODO: Ajustar query builder para la dirección de envío
    async getOrderDetail(user:User, orderId:string):Promise<GetOrderDetailDto>{
        try {
           const order = await this.getOrder(orderId,user.id);
            if(!order){
                throw new NotFoundException('Order not found');
            }
            return{
                id:order.id,
                total:order.total,
                status:order.status,
                shippingAddress:order.shippingAddress,
                orderCreationDate:order.createdAt,
                orderItems: order.items.map((orderItem)=>({
                    id:orderItem.id,
                    productName:orderItem.productName,
                    price:orderItem.price,
                    quantity:orderItem.quantity
                }))
            }
        } catch (error) {
            this.handleDBErrors(error)
        }
    }

    private async getOrder(orderId:string,userId:string):Promise<Order>{
        const order = await this.ordersRepository
                    .createQueryBuilder('order')
                    .innerJoin('order.user', 'user')
                    .innerJoinAndSelect('order.items', 'orderItem') 
                    .select([
                        'order.id',
                        'order.orderNumber',
                        'order.total',
                        'order.status',
                        'order.shippingAddress',
                        'order.createdAt',
                        'orderItem.productId',
                        'orderItem.productName',
                        'orderItem.quantity',
                        'orderItem.price',
                    ])
                    .where('order.id = :orderId', { orderId })
                    .andWhere('user.id = :userId', { userId })
                    .getOne();
                    return order;
    }
     private handleDBErrors( error: any ): never {
    
    
        if ( error.code === '23505' ) 
          throw new BadRequestException( error.detail );
    
        console.log(error)
    
        throw new InternalServerErrorException('Please check server logs');
    
      }

      private generateOrderNumber():string{
        const allowedCharacters ="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        const currentYear = new Date().getFullYear();
        let randomCharacters = '';
        for(let i=0; i<5 ; i++){
            randomCharacters += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));
            
        }
        return `ORD-${currentYear}-${randomCharacters}`

      }

}
