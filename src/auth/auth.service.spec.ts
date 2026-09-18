import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { RefreshToken } from "./entities/refresh_tokens.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { UserProfileDto } from "./dto/login-user.dto";

describe('AuthService', () => {
  //Create services 
  let authService:AuthService;
  let jwtService:JwtService;
  //Create repositories
  let userRepository:Repository<User>;
  let refreshTokenRepository:Repository<RefreshToken>;
  jest.mock('bcrypt',()=>({
    compareSync: jest.fn()
  }));
  jest.mock('bcrypt', () => ({
    hashSync: jest.fn().mockReturnValue('password_hasheado'),
  }));
  jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'), // Mantiene el resto de funciones de crypto intactas
  randomBytes: jest.fn(),
}));
  //Mock repository methods
  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });
   //Mock jwt methods
   const mockJwtService = () => ({
    sign: jest.fn().mockResolvedValue('jwt_generated'),
    verify: jest.fn(),
  });
  


  beforeEach(async()=>{
    const module:TestingModule = await Test.createTestingModule({
      providers:[
        AuthService,
        {
          provide:getRepositoryToken(User),
          useFactory:mockRepository
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useFactory: mockRepository,
        },
         {
          provide: JwtService,
          useFactory: mockJwtService,
        },
      ],
    }).compile();
     authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('Should throw UnauthorizedException if user is not found or is inactive', async () => {
     const loginUserDto = {
        email: 'test@example.com',
        password: 'anyPassword123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        new UnauthorizedException('Incorrect credentials')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where:{ email: loginUserDto.email, isActive:true},
         select: { email: true, password: true, id: true, fullName: true, isActive: true, roles: true, loginAttempts:true,blockUntil:true,lastLoginAt:true,phoneNumber:true}
      })
  });

  it('Should throw ForbiddenException if the account is blocked (blockUntil is in the Future)',async()=>{

    const mockCurrentDate = new Date('2026-09-14T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(mockCurrentDate);
    const futureBlockUntil = new Date(mockCurrentDate.getTime() + 15 * 60 * 1000);
    const loginUserDto = {
        email: 'test@example.com',
        password: 'anyPassword123',
    };
      const mockUser = {
        id: "1f56ada5-269b-4a29-8456-df867ba23155",
        email: loginUserDto.email,
        isActive: true,
        blockUntil: futureBlockUntil,
      };
       jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
       await expect(authService.login(loginUserDto)).rejects.toThrow(
        new ForbiddenException('Account temporarily locked. Try again in 15 minutes.')
       );
       jest.useRealTimers();

  });

  // it('Should increment loginAttempts by one when password is incorrect',async()=>{

  //   const loginUserDto = {
  //       email: 'test@example.com',
  //       password: 'anyPassword123',
  //   };
  //   const mockUser = {
  //       id: "1f56ada5-269b-4a29-8456-df867ba23155",
  //       email: loginUserDto.email,
  //       password: 'hashedPasswordInDb',
  //       isActive: true,
  //       blockUntil: null,
  //       loginAttempts: 2, 
  //     };
  //     jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
  //     jest.spyOn(userRepository,'save').mockResolvedValue(mockUser as any);
  //     jest.mocked(compareSync).mockReturnValue(false);

  //     //Check if the exception is thrown
  //     await expect(authService.login(loginUserDto)).rejects.toThrow(
  //       new UnauthorizedException('Incorrect credentials')
  //     );

  //     expect(mockUser.loginAttempts).toBe(3); // Increased from 2 to 3
  //     expect(mockUser.blockUntil).toBeNull(); // Block until should not be stored yet
  //     expect(userRepository.save).toHaveBeenCalledWith(mockUser);

  // });

  // it('Should store blockUntil when max login attempts are reached',async()=>{
  // const mockCurrentDate = new Date('2026-09-14T10:00:00.000Z');
  // jest.useFakeTimers().setSystemTime(mockCurrentDate);
  //  const expectedLockDate = new Date('2026-09-14T10:15:00.000Z'); // 15 minutes added
  // const loginUserDto = {
  //       email: 'test@example.com',
  //       password: 'anyPassword123',
  //   };
  //   const mockUser = {
  //       id: "1f56ada5-269b-4a29-8456-df867ba23155",
  //       email: loginUserDto.email,
  //       password: 'hashedPasswordInDb',
  //       isActive: true,
  //       blockUntil: null,
  //       loginAttempts: 4, 
  //     };
  //     jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
  //     jest.spyOn(userRepository,'save').mockResolvedValue(mockUser as any);

  //     jest.mocked(compareSync).mockReturnValue(false);
  //      await expect(authService.login(loginUserDto)).rejects.toThrow(
  //       new UnauthorizedException('Incorrect credentials')
  //     );

  //     expect(mockUser.loginAttempts).toBe(5); 
  //     expect(mockUser.blockUntil).toEqual(expectedLockDate); 
  //     expect(userRepository.save).toHaveBeenCalledWith(mockUser);
  //     jest.useRealTimers();
  // })

  it('Should register user',async ()=>{
    const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

    const mockCreatedUser = {
      id: 'uuid-1234',
      email: 'test@example.com',
      password: 'password_hasheado',
      fullName: 'Test User',
    };

      jest.spyOn(userRepository,'create').mockReturnValue(mockCreatedUser as any);
      jest.spyOn(userRepository,'save').mockResolvedValue(mockCreatedUser as any);

      jest.spyOn(jwtService as any, 'sign').mockReturnValue('token_real_de_prueba_123');

      const result = await authService.create(createUserDto);
      // expect(bcrypt.hashSync).toHaveBeenCalledTimes(1);
      // expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password:  expect.any(String),
        fullName: 'Test User',
      });

      expect(userRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 'uuid-1234' });

       expect(result).toEqual({
      user: {
        id: 'uuid-1234',
        email: 'test@example.com',
        fullName: 'Test User',
      },
      token: 'token_real_de_prueba_123',
    });
  })

  it('Should generate refresh token',async()=>{
    const userProfile:UserProfileDto={
      id: 'uuid-1234',
      email: 'test@example.com',
      fullName: 'Test User', 
      isActive: true,
      roles: ['user'] 
    }
    
    const mockCurrentDate = new Date('2026-09-14T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(mockCurrentDate);
    const refreshTokenExpiresDate = new Date(mockCurrentDate);
    refreshTokenExpiresDate.setDate(refreshTokenExpiresDate.getDate() + 7); 
    const mockCreatedRefreshToken ={
        id: 'uuid-1234',
          token:'secure_string',
          expiresAt:refreshTokenExpiresDate,
          user:userProfile
    }
    const generateSecureString = jest.spyOn(AuthService.prototype as any, 'generateSecureString');
    generateSecureString.mockReturnValue("secure_string");
    jest.spyOn(refreshTokenRepository,'create').mockReturnValue(mockCreatedRefreshToken as any);
    jest.spyOn(refreshTokenRepository,'save').mockResolvedValue(mockCreatedRefreshToken as any);
    const result = await authService.generateRefreshToken(userProfile);
    
    expect(result).toBe('secure_string');
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
       token:'secure_string',
          expiresAt:refreshTokenExpiresDate,
          user:userProfile
    })
    expect(refreshTokenRepository.save).toHaveBeenCalledWith(mockCreatedRefreshToken);
    jest.useRealTimers();

  })

});