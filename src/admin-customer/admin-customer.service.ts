import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminCustomerService {

    constructor(@InjectRepository(User) private readonly usersRepository:Repository<User>){}


    


}
