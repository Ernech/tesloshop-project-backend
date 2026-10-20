import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
import { ProductPaginationDto } from './dto/product-pagination.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ProductSizeStock } from './entities/product-size-stock.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    @InjectRepository(ProductSizeStock)
    private readonly productSizeStockRepository: Repository<ProductSizeStock>,

    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const {productSizes, images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        sizeStocks:productSizes.map((productSize)=>this.productSizeStockRepository.create(productSize)),
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
       
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: ProductPaginationDto) {
    const { limit = 10, page = 1, gender = '' } = paginationDto;
    const skip = (page -1)*limit;
    const products = await this.productRepository.find({
      take: limit,
      skip: skip,
      relations: {
        images: true,
        sizeStocks:true,
      },
      order: {
        id: 'ASC',
      },
      where: gender ? [{ gender }, { gender: 'unisex' },{isActive:true}] : {isActive:true},
    });

    const totalProducts = await this.productRepository.count({
      where: gender ? [{ gender }, { gender: 'unisex' }] : {},
    });

    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit),
      products: products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      })),
    };
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .andWhere('prod.isActive=:isActive',{isActive:true})
        .leftJoinAndSelect('prod.images', 'prodImages')
        .innerJoinAndSelect('prod.sizeStocks','sizeStock')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

async update(id: string, updateProductDto: UpdateProductDto) {
    // 1. Extraemos productSizes junto a las imágenes del DTO
    const { images, productSizes, ...toUpdate } = updateProductDto;

    // El preload cargará las propiedades planas del producto
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    // Create query runner para el control absoluto de la transacción ACID
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ==== MANEJO DE IMÁGENES (Lógica original de Teslo Shop) ====
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      // ==== NUEVO: MANEJO DE STOCK POR TALLAS (Upsert manual controlado) ====
      if (productSizes) {
        for (const sizeDto of productSizes) {
          // Buscamos si el producto ya cuenta con un registro para esta talla específica
          const existingSizeStock = await queryRunner.manager.findOne(ProductSizeStock, {
            where: { product: { id }, size: sizeDto.size }
          });

          if (existingSizeStock) {
            // Caso A: Si ya existe la combinación Talla + Producto, ACTUALIZAMOS su stock
            existingSizeStock.stock = sizeDto.stock;
            await queryRunner.manager.save(existingSizeStock);
          } else {
            // Caso B: Si es una nueva talla que el administrador añadió, INSERTAMOS el registro
            const newSizeStock = queryRunner.manager.create(ProductSizeStock, {
              size: sizeDto.size,
              stock: sizeDto.stock,
              product: { id } // Vinculamos directamente al ID del producto actual
            });
            await queryRunner.manager.save(newSizeStock);
          }
        }
      }

      // Guardamos los cambios estructurales del producto (título, precio, imágenes, etc.)
      await queryRunner.manager.save(product);

      // Si todo sale bien, consolidamos cambios y liberamos recursos
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // Invalidamos las cachés correspondientes
      await this.cacheManager.del('/products');
      await this.cacheManager.del(`/products/${id}`); 

      return this.findOnePlain(id);

    } catch (error) {
      // Ante cualquier fallo del ciclo, revertimos la base de datos completa
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
}

  async remove(id: string) {
    try {
      
      const product = await this.findOne(id);
      if(!product){
        throw new NotFoundException(`The product with the id ${id} does not exists.`)
      }
      product.isActive = false
      await this.productRepository.save(product);
       await this.cacheManager.del('/products');
      await this.cacheManager.del(`/products/${id}`); 
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      await this.cacheManager.del('/products');
      return await query.delete().execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
