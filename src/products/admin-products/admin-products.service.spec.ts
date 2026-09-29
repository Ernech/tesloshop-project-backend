import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductsService } from './admin-products.service';
import { Repository } from 'typeorm';
import { Product, ProductImage } from '../entities';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AdminProductsService', () => {
   let adminProductService: AdminProductsService;
   let productRepository:Repository<Product>;
   let orderItemRepository:Repository<OrderItem>;

   const queryBuilderMock = ()=>({
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
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProductsService,
        {
          provide: getRepositoryToken(Product),
          useFactory: queryBuilderMock
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory:queryBuilderMock
        }
      ],
    }).compile();
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    orderItemRepository = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    adminProductService = module.get<AdminProductsService>(AdminProductsService);
  });

  it('should be defined', () => {
    expect(adminProductService).toBeDefined();
  });

  //  it('should be defined', () => {
  //    expect(true).toBe(true);
  //  });
});
