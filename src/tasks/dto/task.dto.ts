import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';

import {
  PartialType,
  OmitType,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { TaskStatus } from '../../utils/interface/interface.js';

const trim = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

export class TaskDto {
  @ApiProperty({
    example: 1,
    description: 'Task ID',
  })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({
    example: 'Complete NestJS assignment',
    description: 'Title of the task',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Current status of the task',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiPropertyOptional({
    example: 'Implement authentication and Swagger documentation',
    description: 'Detailed description of the task',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description: string;
}

export class CreateTaskDto {
  @ApiProperty({
    example: 'Complete NestJS assignment',
    description: 'Title of the task',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    example: 'Implement JWT authentication and Swagger documentation',
    description: 'Description of the task',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the project this task belongs to',
  })
  @IsInt()
  @IsPositive()
  projectId: number;
}

export class UpdateTaskDto extends PartialType(
  OmitType(TaskDto, ['id'] as const),
) {}

export class TaskResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Complete NestJS assignment' })
  title: string;

  @ApiPropertyOptional({
    example: 'Implement authentication and Swagger documentation',
  })
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  status: TaskStatus;

  @ApiPropertyOptional({ example: '2026-11-04T10:00:00.000Z' })
  created_at?: Date;
}
