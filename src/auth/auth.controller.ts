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
  createUser(@Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login', description: 'Authenticates a user and returns a JWT token.' })
  @ApiBody({ type: LoginUserDto }) 
  @ApiResponse({ status: 200, description: 'Success', type:LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  async refreshSession(@Req() req:Request,@Res({passthrough:true}) res:Response){
    const currentRefreshToken = req.cookies['refreshToken'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException('Refresh TOken Not Found');
    }
    const {newAccessToken,newRefreshToken} = await this.authService.refreshAccessToken(currentRefreshToken);
    res.cookie('refreshToken',newRefreshToken,this.cookieOptions);
    return {accessToken:newAccessToken}
  }

  @Post('logout')
  async logoutApp(@Req() req:Request){
     const currentRefreshToken = req.cookies['refreshToken'];
    if (!currentRefreshToken) {
      throw new UnauthorizedException('Refresh TOken Not Found');
    }
    await this.authService.revokeRefreshToken(currentRefreshToken);
    return {"Message":"Log out exitoso"}
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
