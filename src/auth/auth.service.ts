import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshToken } from './entities/refresh_tokens.entity';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository:Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}


  async create( createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save( user )
      delete user.password;

      return {
        user: user,
        token: this.getJwtToken({ id: user.id })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async generateRefreshToken(user:User):Promise<string>{
    try {
      const expiresAt= new Date();
      expiresAt.setDate(expiresAt.getDate()+7);

      const token = this.getJwtToken({id:user.id},'7d')
      const newRefrehToken = this.refreshTokenRepository.create({
        token,
        expiresAt,
        user
      })
      await this.refreshTokenRepository.save(newRefrehToken);
      return token;
      
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login( loginUserDto: LoginUserDto ) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true, isActive: true, roles: true}
    });

    if ( !user ) 
      throw new UnauthorizedException('Credentials are not valid (email)');
      
    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid (password)');

    delete user.password;

    return {
      user: user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async refreshAccessToken(refreshToken:string){
   const payload= this.jwtService.verify(refreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
      where:{token:refreshToken,isActive:true},
      relations:['user']
    })
    if(!storedToken || storedToken.expiresAt<new Date()){
      throw new UnauthorizedException("Refreh token no válido")

    }
    storedToken.isActive=false;
    await this.refreshTokenRepository.save(storedToken);
    //Generate new Token
    const newAccessToken = this.getJwtToken(payload);
    const newRefreshToken = await this.generateRefreshToken(storedToken.user);
    return {newAccessToken,newRefreshToken};

  }

  async revokeRefreshToken(token: string) {
    await this.refreshTokenRepository.update({ token }, { isActive: false });
  }

  async checkAuthStatus( user: User ){

    return {
      user: user,
      token: this.getJwtToken({ id: user.id })
    };

  }


  
  private getJwtToken( payload: JwtPayload, duration:string='30m' ) {
    const token = this.jwtService.sign( payload,{ expiresIn: duration } );
    return token;

  }

  private handleDBErrors( error: any ): never {


    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }


}
