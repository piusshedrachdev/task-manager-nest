import { IsString, IsNumber} from 'class-validator'

export class UserIdentityDto {
    @IsString()
    name:string;

    @IsString()
    email:string;

    @IsNumber()
    id:number;

    @IsString()
    role:string
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'pius Shedrach',
    description: 'Full name of the user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'pius@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'piius@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
  })
  @IsString()
  password: string;
}

