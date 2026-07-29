import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata, Res, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { RawHeaders, GetUser, Auth } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { Response,Request } from 'express';
import { LoginResponseDto } from './dto/login-user.dto';
import { RefreshSessionDTO } from './dto/refresh-session.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly cookieOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: 'strict' as const, 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({type:CreateUserDto})
  @ApiResponse({ status: 201, description: 'Created', type:LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Register User', description: 'Creates a new user and returns a JWT token and user profile.' })
  async createUser(@Body() createUserDto: CreateUserDto ) {
    return await this.authService.create( createUserDto );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login', description: 'Authenticates a user and returns a JWT token and user profile.' })
  @ApiBody({ type: LoginUserDto }) 
  @ApiResponse({ status: 200, description: 'Success', type:LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response ) {
    const loginResponse = await this.authService.login( loginUserDto );
    const refreshToken = await this.authService.generateRefreshToken(loginResponse.user);
    res.cookie('refreshToken',refreshToken,this.cookieOptions);
    return loginResponse;
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Session', description: 'Refresh user session and returns a new JWT token.' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Created', type:RefreshSessionDTO })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async refreshSession(@Req() req:Request,@Res({passthrough:true}) res:Response){
    const currentRefreshToken = req.cookies['refreshToken'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException('Refresh Token Not Found');
    }
    const {newAccessToken,newRefreshToken} = await this.authService.refreshAccessToken(currentRefreshToken);
    res.cookie('refreshToken',newRefreshToken,this.cookieOptions);
    return {accessToken:newAccessToken}
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout', description: 'Ends the current user session and revokes the tokens.' })
  @ApiResponse({ status: 200, description: 'Created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async logoutApp(@Req() req:Request){
     const currentRefreshToken = req.cookies['refreshToken'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException('Refresh Token Not Found');
    }
    await this.authService.revokeRefreshToken(currentRefreshToken);
    return {"Message":"Succesfully Logout"}
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {


    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }


  // @SetMetadata('roles', ['admin','super-user'])

  @Get('private2')
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user
    }
  }


  @Get('private3')
  @Auth( ValidRoles.admin )
  privateRoute3(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user
    }
  }



}
