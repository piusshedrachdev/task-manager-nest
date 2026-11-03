import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsEnum,
  IsNumber,
} from 'class-validator';

import {
  PartialType,
  OmitType,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { TaskStatus } from '../../utils/interface/interface.js';

export class TaskDto {
  @ApiProperty({
    example: '1',
    description: 'Task ID',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'Complete NestJS assignment',
    description: 'Title of the task',
  })
  @IsString()
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
  description: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Started working on authentication', 'Swagger documentation completed'],
    description: 'Comments associated with the task',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comment: string[];
}

export class CreateTaskDto {
  @ApiProperty({
    example: 'Complete NestJS assignment',
    description: 'Title of the task',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Implement JWT authentication and Swagger documentation',
    description: 'Description of the task',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the project this task belongs to',
  })
  @IsNumber()
  projectId: number;
}

export class UpdateTaskDto extends PartialType(
  OmitType(TaskDto, ['id'] as const),
) {}

export class AddCommentDto {
  @ApiProperty({
    example: 'Completed the authentication implementation',
    description: 'Comment to add to the task',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class UpdateStatusDto {
  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.DOING,
    description: 'New status of the task',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}