import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshToken } from './entities/refresh_tokens.entity';
import { randomBytes } from 'crypto';
import { LoginResponseDto, UserProfileDto } from './dto/login-user.dto';
import { use } from 'passport';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository:Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}


  async create( createUserDto: CreateUserDto):Promise<LoginResponseDto> {
    
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

  async generateRefreshToken(user:UserProfileDto):Promise<string>{
    try {
      const expiresAt= new Date();
      expiresAt.setDate(expiresAt.getDate()+7);

      const token = this.generateSecureString();
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

  private generateSecureString(
    byteLength: number = 32, 
    encoding: 'hex' | 'base64' | 'base64url' = 'hex'
  ): string {
   
    const buffer = randomBytes(byteLength);
    
    return buffer.toString(encoding);
  }

  async login( loginUserDto: LoginUserDto ):Promise<LoginResponseDto> {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true, isActive: true, roles: true}
    });

    if ( !user ) 
      throw new UnauthorizedException('Credentials are not valid');
      
    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid');

    return {
      user: {
        id: user.id,
        fullName:user.fullName,
        email: user.email,
        roles:user.roles,
        isActive:user.isActive,
      },
      token: this.getJwtToken({ id: user.id })
    };
  }

  async refreshAccessToken(refreshToken:string){
   
    const storedToken = await this.refreshTokenRepository.findOne({
      where:{token:refreshToken,isActive:true},
      relations: { 
        user: true
      }
    })
    if(!storedToken || storedToken.expiresAt<new Date()){
      throw new UnauthorizedException("Refreh token invalid")

    }
    try {
      storedToken.isActive=false;
      await this.refreshTokenRepository.save(storedToken);
      //Generate new Token
      const newAccessToken = this.getJwtToken({id:storedToken.user.id});
      const newRefreshToken = await this.generateRefreshToken(storedToken.user);
      return {newAccessToken,newRefreshToken};
    } catch (error) {
      this.handleDBErrors(error);
    }
   

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


  
  private getJwtToken( payload: JwtPayload) {
    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErrors( error: any ): never {


    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }


}
