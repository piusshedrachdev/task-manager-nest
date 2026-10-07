import { IsString, IsOptional, IsArray, IsNotEmpty} from 'class-validator'
import {PartialType} from '@nestjs/mapped-types'


export class TaskDto{
    @IsString()
    id:string;

    @IsString()
    title: string;

    @IsString()
    status: string;

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
