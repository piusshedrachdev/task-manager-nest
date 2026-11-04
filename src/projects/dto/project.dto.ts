import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  PartialType,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { TaskResponseDto } from '../../tasks/dto/task.dto.js';

const trim = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

export class ProjectDto {
  @ApiProperty({ example: 1, description: 'Project ID' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({
    example: 'Task Management System',
    description: 'Project title',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}

export class CreateProjectDto {
  @ApiProperty({
    example: 'Task Management System',
    description: 'Title of the project',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Task Management System' })
  title: string;

  @ApiPropertyOptional({
    type: [TaskResponseDto],
    description: 'Tasks belonging to the project (included in list and get)',
  })
  tasks?: TaskResponseDto[];
}
