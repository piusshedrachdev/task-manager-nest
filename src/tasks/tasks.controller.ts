import { Controller, Get, Post, Delete, Put, Body, Param } from '@nestjs/common';
import {TasksService } from './tasks.service.js'
import { HttpCode, HttpStatus } from '@nestjs/common';
import { CreateTaskDto, UpdateProductDto } from './dto/task.dto.js';

@Controller('tasks')
export class TasksController {

    constructor(private readonly service:TasksService){}

    @HttpCode(HttpStatus.OK)
    @Get()
    getAllTasks(){
        return this.service.getAllTasks();
    }

    @Get(':id')
    getTaskById(@Param('id') id:string){
        return this.service.getTaskById(id);
    }

    @Post()
    createTask(@Body() task:CreateTaskDto){
        return this.service.createTask(task);
    }

    @Put(':id')
    updateTask(@Param('id') id:string, @Body() task:UpdateProductDto){
        return this.service.updateTask({...task, id});
    }

    @Delete(':id')
    deleteTask(@Param('id') id:string){
        return this.service.deleteTask(id);
    }
}
