import { Controller, Get, Post, Delete, Put, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import {TasksService } from './tasks.service.js'
import { HttpCode, HttpStatus } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type {AuthenticatedRequest} from '../utils/interface/interface.js';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('tasks')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TasksController {

    constructor(private readonly service:TasksService){}

    @HttpCode(HttpStatus.OK)
    @Get()
    @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
    getAllTasks(@Req() req:AuthenticatedRequest){
        return this.service.getAllTasks(req.user?.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by id' })
    getTaskById(@Req() req:AuthenticatedRequest, @Param('id') id:number){
        return this.service.getTaskById(req.user?.id, id);
    }


    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    createTask(@Req() req:AuthenticatedRequest, @Body() task:CreateTaskDto){
        return this.service.createTask(req, task);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task' })
    updateTask(@Req() req:AuthenticatedRequest, @Param('id') id:number, @Body() task:UpdateTaskDto){
        return this.service.updateTask(req.user?.id, id, task);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task' })
    deleteTask(@Req() req:AuthenticatedRequest, @Param('id') id:number){
        return this.service.deleteTask(req.user?.id, id);
    }
}
