import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import { Task } from '../utils/types/tasks.js'
import {Return} from '../utils/interface/interface.js'


const TASK_FILE_NAME = process.env.TASK_FILE_NAME ?? ""
@Injectable()
export class TasksService {
    constructor(private dbService: DbService, private memTasks: Task[]){}

    async saveTasks(_tasks:Task[]):Promise<any>{
        try{
            await this.dbService.write(TASK_FILE_NAME, JSON.stringify(_tasks, null, 1));
            this.memTasks = _tasks;
            return
        }catch(error){
            throw error
        }
    }

    async fetchTasks(): Promise<Return<Task[]>>{
        if(this.memTasks) return {success:true, data: this.memTasks}

        const response = await this.dbService.read(TASK_FILE_NAME)

        if(response.success && response.data)
        {
            try{
                const parsedTasks:Task[] = JSON.parse(response.data)
                this.memTasks = parsedTasks
                return {success:true, data:parsedTasks}
            }catch(error){
                return {success:false, error:error}
            }
        }

        return {success:false, error:response.error}
    }
}