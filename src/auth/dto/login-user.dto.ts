import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';


export class LoginUserDto {

    @IsString()
    @IsEmail()
    @ApiProperty({
        description: 'The registered email address of the user',
        example: 'user@tesloshop.com',
        required: true,
    })
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    @ApiProperty({
        description: 'The account password',
        example: 'SecurePass123!',
        required: true,
        minLength: 6,
    })
    password: string;

}

  export class UserProfileDto {
    @ApiProperty({ example: '32f22b7c-87d3-4809-aa7d-536cf0da247d' })
    id: string;

    @ApiProperty({ example: 'user@tesloshop.com' })
    email: string;

    @ApiProperty({ example: 'John Doe' })
    fullName: string;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: ['user'] })
    roles: string[];
    }

export class LoginResponseDto {
  @ApiProperty({ 
    description: 'JSON Web Token (JWT) used for authenticating protected routes',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  token: string;

  @ApiProperty({ description: 'The authenticated user data' })
  user: UserProfileDto;
}