import { Controller, Get, Post, Delete, Put, Body } from '@nestjs/common';
import {TasksService } from './tasks.service.js'
import { HttpCode, HttpStatus } from '@nestjs/common';

@Controller('tasks')
export class TasksController {

    constructor(private readonly service:TasksService){}

    @HttpCode(HttpStatus.OK)
    @Get()
    getAllTasks(){
        return //this.service.getAllTasks();
    }

    @Get()
    getTaskById(@Body('id') id:string){
        return //this.service.getTaskById(id);
    }

    @Post()
    createTask(@Body() task:any){
        return //this.service.createTask(task);
    }

    @Put()
    updateTask(@Body() task:any){
        return //this.service.updateTask(task);
    }

    @Delete()
    deleteTask(@Body('id') id:string){
        return //this.service.deleteTask(id);
    }
}
