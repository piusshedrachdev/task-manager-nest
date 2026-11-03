import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class ProjectDto {
    @ApiProperty({ example: 1, description: 'Project ID' })
    @IsInt()
    id: number;

    @ApiProperty({
        example: 'Task Management System',
        description: 'Project title',
    })
    @IsString()
    @IsNotEmpty()
    title: string;
}

export class CreateProjectDto {
    @ApiProperty({
        example: 'Task Management System',
        description: 'Title of the project',
    })
    @IsString()
    @IsNotEmpty()
    title: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
