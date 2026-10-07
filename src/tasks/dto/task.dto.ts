import { IsString, IsOptional, IsArray, IsNotEmpty, IsEnum} from 'class-validator'
import {PartialType} from '@nestjs/mapped-types'
import { TaskStatus } from '../../utils/interface/interface.js'


export class TaskDto{
    @IsString()
    id:string;

    @IsString()
    title: string;

    @IsEnum(TaskStatus)
    status: TaskStatus;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    comment: string[];
}

export class CreateTaskDto{
    @IsString()
    title:string;

    @IsString()
    @IsOptional()
    description:string;
}

export class UpdateProductDto extends PartialType(TaskDto){

}

export class AddCommentDto{
    @IsString()
    @IsNotEmpty()
    text: string;
}

export class UpdateStatusDto{
    @IsEnum(TaskStatus)
    status: TaskStatus;
}
