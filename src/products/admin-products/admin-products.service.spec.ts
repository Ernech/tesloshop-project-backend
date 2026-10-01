import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductsService } from './admin-products.service';
import { Repository } from 'typeorm';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../entities';

describe('AdminProductsService', () => {
   let adminProductService: AdminProductsService;
   let productRepository:Repository<Product>;
   let dataSourceMock: any;
   const queryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {

      dataSourceMock = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: dataSourceMock
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue:dataSourceMock
        }
      ],
    }).compile();
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  
    adminProductService = module.get<AdminProductsService>(AdminProductsService);
  });

  it('should be defined', () => {
    expect(adminProductService).toBeDefined();
  });

  // it('Should return top sellers with the correct data types',async()=>{

  //   const mockRawData = {
  //     message: `Top 5 best-selling produtcs`,
  //     date: new Date(),
  //     products:   [
      
  //     {
  //         id: 'afc97f4e-d21b-4171-a5f1-7e42ce02e158',
  //         title: 'Test t-shirt',
  //         sku: 'TSHIRT-01',
  //         price: '25.00',      
  //         stock: '15',
  //         unitsSold: '130',    
  //         totalRevenue: '3000.00',
  //       },
  //        {
  //         id: 'afc97f4e-d21b-4171-a5f1-7e42ce02e158',
  //         title: 'Test t-shirt',
  //         sku: 'TSHIRT-02',
  //         price: '30.00',      
  //         stock: '25',
  //         unitsSold: '125',    
  //         totalRevenue: '6000.00',
  //       },
  //        {
  //         id: 'afc97f4e-d21b-4171-a5f1-7e42ce02e158',
  //         title: 'Test t-shirt',
  //         sku: 'TSHIRT-03',
  //         price: '28.00',      
  //         stock: '16',
  //         unitsSold: '120',    
  //         totalRevenue: '3000.00',
  //       },
  //        {
  //         id: 'afc97f4e-d21b-4171-a5f1-7e42ce02e158',
  //         title: 'Test t-shirt',
  //         sku: 'TSHIRT-04',
  //         price: '25.00',      
  //         stock: '15',
  //         unitsSold: '115',    
  //         totalRevenue: '3000.00',
  //       },
  //        {
  //         id: 'afc97f4e-d21b-4171-a5f1-7e42ce02e158',
  //         title: 'Test t-shirt',
  //         sku: 'TSHIRT-05',
  //         price: '25.00',      
  //         stock: '15',
  //         unitsSold: '110',    
  //         totalRevenue: '3000.00',
  //       },
  //     ]};

  //    queryBuilderMock.getRawMany.mockResolvedValue(mockRawData);

  //   const limit = 5;
  //   const result = await adminProductService.getTopBestSellingProducts(limit);

  //   // 3. Aserciones del resultado
  //   expect(result.message).toBe(`Top ${limit} best-selling produtcs`);
  //   expect(result.date).toBeInstanceOf(Date);
  //   expect(result.products).toBeDefined(); 
  //   // Nota: Como usas plainToInstance, result.products será una instancia de TopSellerProductDTO

  //   // 4. Verificación de llamadas del QueryBuilder
  //   expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');
  //   expect(queryBuilderMock.select).toHaveBeenCalledWith([
  //     "product.id AS id",
  //     "product.title AS title",
  //     "product.slug AS slug",
  //     "product.price AS price",
  //     "product.stock AS stok"
  //   ]);
  //   expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('SUM(orderItem.quantity)', 'unitsSold');
  //   expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('SUM(orderItem.quantity*orderItem.price)', 'totalRevenue');
  //   expect(queryBuilderMock.innerJoin).toHaveBeenCalledWith(expect.any(Function), 'orderItem', 'orderItem.product.id = product.id'); // Usamos expect.any(Function) por la clase OrderItem
  //   expect(queryBuilderMock.innerJoin).toHaveBeenCalledWith('orderItem.order', 'order', 'order.status = :status', { status: OrderStatus.PAID });
  //   expect(queryBuilderMock.groupBy).toHaveBeenCalledWith('product.id');
  //   expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('\"unitsSold\"', 'DESC');
  //   expect(queryBuilderMock.limit).toHaveBeenCalledWith(limit);
  //   expect(queryBuilderMock.getRawMany).toHaveBeenCalledTimes(1);

  // })
});
