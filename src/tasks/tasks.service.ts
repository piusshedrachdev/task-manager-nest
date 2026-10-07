import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import {Return} from '../utils/interface/interface.js'
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
        return this.memTasks.find(task => task.id === id)
    }

    async createTask(task:CreateTaskDto){
        await this.fetchTasks()
        const newTask:TaskDto = {
            id: Date.now().toString(),
            status: "pending",
            comment:"",
            ...task
        }
        this.memTasks.push(newTask)
        await this.saveTasks(this.memTasks)
        return newTask
    }

    async updateTask(task:UpdateProductDto){
        await this.fetchTasks()
        const index = this.memTasks.findIndex(t => t.id === task.id)
        if(index !== -1){
            this.memTasks[index] = {...this.memTasks[index], ...task}
            await this.saveTasks(this.memTasks)
        }
    }

    async deleteTask(id:string){
        await this.fetchTasks()
        const index = this.memTasks.findIndex(t => t.id === id)
        if(index !== -1){
            this.memTasks.splice(index, 1)
            await this.saveTasks(this.memTasks)
        }
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
                return {success:true, data:parsedTasks}
            }catch(error){
                return {success:false, error:error}
            }
        }

        this.loaded = true
        return {success:false, error:response.error}
    }
}