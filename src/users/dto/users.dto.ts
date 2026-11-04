import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const trim = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class UserIdentityDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  id: number;

  @IsString()
  role: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'pius Shedrach',
    description: 'Full name of the user',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'pius@example.com',
    description: 'User email address',
  })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'Password123',
    description:
      'User password (minimum 8 characters, with uppercase, lowercase and a number)',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;
}

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'Pius Shedrach' })
  name: string;

  @ApiProperty({ example: 'pius@example.com' })
  email: string;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'] })
  role: string;
}

export class ChangeRoleResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'admin', enum: ['user', 'admin'] })
  role: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'pius@example.com',
  })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
