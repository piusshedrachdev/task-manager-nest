import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto.js';
import {ConfigService} from '@nestjs/config'

import { Task } from './entities/task.entity.js';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { AuthenticatedRequest } from '../utils/interface/interface.js';

@Injectable()
export class TasksService {
    constructor(
        private configService:ConfigService,

        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
    
    ){
        //this.TASK_FILE_NAME = this.configService.get<string>("TASK_FILE_NAME") ?? "tasks.json"
    }

    async getAllTasks(uid:number){
        const tasks = await this.taskRepository.find({ 
            where: {
                project: {
                    user: {
                        id: uid,
                    },
                },
            }
        });
        return tasks;
    }

    async getTaskById(uid:number, id:number){

        const task = await this.taskRepository.findOneBy({
            id, 
            project: {
                user: {
                    id: uid,
                },
            },
        })

        if(!task){
            throw new NotFoundException(`Task with id "${id}" not found`)
        }

        return task
    }

    async createTask(req: AuthenticatedRequest, task: CreateTaskDto){

        const tasks = this.taskRepository.create({
            title: task.title,
            description: task.description,
            project: {
                id: task.projectId
            }
        })

        return await this.taskRepository.save(tasks)
    }

    async updateTask(uid:number, id:number, taskDto:UpdateTaskDto){

        const result  = await this.taskRepository.update(
            { id: id, project: { user: { id: uid } } },
            taskDto
        )
        
        if (result.affected === 0) {
            throw new NotFoundException(`Task ${id} not found`);
        }

        return this.taskRepository.findOneBy({ id });    
    }

    async deleteTask(uid:number, id:number){

        const result  = await this.taskRepository.delete({ 
            id, 
            project: {
                    user: {
                        id: uid,
                    },
                },
         })
        
        if (result.affected === 0) {
            throw new NotFoundException(`Task ${id} not found`);
        }

    }
}
