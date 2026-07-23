import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { RefreshToken } from 'src/auth/entities/refresh_tokens.entity';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
     @InjectRepository( RefreshToken )
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}


  async runSeed() {

    await this.deleteTables();
   
    const adminUser = await this.insertUsers();
    await this.insertNewProducts( adminUser );

    return 'SEED EXECUTED';
  }

  private async deleteTables() {

    await this.productsService.deleteAllProducts();
    const refreshTokenQueryBuilder = this.refreshTokenRepository.createQueryBuilder();
    await refreshTokenQueryBuilder.delete()
      .execute();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .execute()

  }

  private async insertUsers() {
    
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) )
    });
  

    const dbUsers = await this.userRepository.save( users )

    return dbUsers[0];
  }


  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productsService.create( product, user ) );
    });

    await Promise.all( insertPromises );


    return true;
  }


}
