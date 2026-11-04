import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity.js';
import { Projects } from '../projects/entity/project.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Projects])],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
