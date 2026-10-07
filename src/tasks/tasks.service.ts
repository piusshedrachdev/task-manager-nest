import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DbService } from '../db/db.service.js';
import {Return, TaskStatus} from '../utils/interface/interface.js'
import { CreateTaskDto, TaskDto, UpdateProductDto } from './dto/task.dto.js';
import {ConfigService} from '@nestjs/config'

@Injectable()
export class TasksService {
    private TASK_FILE_NAME: string;
    private memTasks: TaskDto[] = [];
    private loaded = false;

    constructor(private dbService: DbService, private configService:ConfigService){
        this.TASK_FILE_NAME = this.configService.get<string>("TASK_FILE_NAME") ?? "tasks.json"
    }

    async getAllTasks(){
       await this.fetchTasks()
       return this.memTasks
    }

    async getTaskById(id:string){
        await this.fetchTasks()
        const task = this.memTasks.find(task => task.id === id)
        if(!task) throw new NotFoundException(`Task with id "${id}" not found`)
        return task
    }

    async getComments(id:string){
        const task = await this.getTaskById(id)
        return task.comment
    }

    async addComment(id:string, text:string){
        await this.fetchTasks()
        const index = this.memTasks.findIndex(t => t.id === id)
        if(index === -1) throw new NotFoundException(`Task with id "${id}" not found`)

        const comments = [...(this.memTasks[index].comment ?? []), text]
        this.memTasks[index] = {...this.memTasks[index], comment: comments}
        await this.saveTasks(this.memTasks)
        return comments
    }

    async updateStatus(id:string, status:TaskStatus){
        await this.fetchTasks()
        const index = this.memTasks.findIndex(t => t.id === id)
        if(index === -1) throw new NotFoundException(`Task with id "${id}" not found`)

        this.memTasks[index] = {...this.memTasks[index], status}
        await this.saveTasks(this.memTasks)
        return this.memTasks[index]
    }

    async createTask(task:CreateTaskDto){
        await this.fetchTasks()
        const newTask:TaskDto = {
            status: TaskStatus.TODO,
            comment:[],
            ...task,
            id: randomUUID()
        }
        this.memTasks.push(newTask)
        await this.saveTasks(this.memTasks)
        return newTask
    }

    async updateTask(task:UpdateProductDto){
        await this.fetchTasks()
        const index = this.memTasks.findIndex(t => t.id === task.id)
        if(index === -1) throw new NotFoundException(`Task with id "${task.id}" not found`)
        this.memTasks[index] = {...this.memTasks[index], ...task}
        await this.saveTasks(this.memTasks)
        return this.memTasks[index]
    }

    async deleteTask(id:string){
        await this.fetchTasks()
        const index = this.memTasks.findIndex(t => t.id === id)
        if(index === -1) throw new NotFoundException(`Task with id "${id}" not found`)
        this.memTasks.splice(index, 1)
        await this.saveTasks(this.memTasks)
        return { id, deleted: true }
    }

    private async saveTasks(_tasks:TaskDto[]):Promise<any>{
        try{
            await this.dbService.write(this.TASK_FILE_NAME, JSON.stringify(_tasks, null, 1));
            this.memTasks = _tasks;
            return
        }catch(error){
            throw error
        }
    }

    private async fetchTasks(): Promise<Return<TaskDto[]>>{
        if(this.loaded) return {success:true, data: this.memTasks}

        const response = await this.dbService.read(this.TASK_FILE_NAME)

        if(response.success && response.data)
        {
            try{
                const parsedTasks:TaskDto[] = JSON.parse(response.data)
                this.memTasks = parsedTasks
                this.loaded = true
                return {success:true, data:this.memTasks}
            }catch(error){
                return {success:false, error:error}
            }
        }

        this.loaded = true
        return {success:false, error:response.error}
    }
}
