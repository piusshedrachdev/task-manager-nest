import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto.js';
import { Task } from './entities/task.entity.js';
import { Projects } from '../projects/entity/project.entity.js';
import { ResourceNotFoundException } from '../common/errors/app.exception.js';

import type { AuthenticatedRequest } from '../utils/interface/interface.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Projects)
    private readonly projectRepository: Repository<Projects>,
  ) {}

  async getAllTasks(uid?: number) {
    const userId = this.requireUserId(uid);

    return this.taskRepository.find({
      where: {
        project: {
          user: {
            id: userId,
          },
        },
      },
    });
  }

  async getTaskById(uid: number | undefined, id: number) {
    const userId = this.requireUserId(uid);

    const task = await this.taskRepository.findOneBy({
      id,
      project: {
        user: {
          id: userId,
        },
      },
    });

    if (!task) {
      throw new ResourceNotFoundException('Task', id);
    }

    return task;
  }

  async createTask(req: AuthenticatedRequest, task: CreateTaskDto) {
    const userId = this.requireUserId(req.user?.id);

    const project = await this.projectRepository.findOne({
      where: {
        id: task.projectId,
        user: {
          id: userId,
        },
      },
    });

    if (!project) {
      throw new ResourceNotFoundException('Project', task.projectId);
    }

    const newTask = this.taskRepository.create({
      title: task.title,
      description: task.description,
      project: {
        id: task.projectId,
      },
    });

    return this.taskRepository.save(newTask);
  }

  async updateTask(
    uid: number | undefined,
    id: number,
    taskDto: UpdateTaskDto,
  ) {
    const task = await this.getTaskById(uid, id);

    this.taskRepository.merge(task, taskDto);

    return this.taskRepository.save(task);
  }

  async deleteTask(uid: number | undefined, id: number) {
    await this.getTaskById(uid, id);

    await this.taskRepository.delete({ id });

    return { id, deleted: true };
  }

  private requireUserId(uid?: number): number {
    if (typeof uid !== 'number') {
      throw new UnauthorizedException('Invalid token payload');
    }

    return uid;
  }
}
