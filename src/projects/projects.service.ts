import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto.js';
import { Projects } from './entity/project.entity.js';
import { ResourceNotFoundException } from '../common/errors/app.exception.js';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Projects)
        private readonly projectRepository: Repository<Projects>,
    ) {}

    async getAllProjects(uid:number) {
        return await this.projectRepository.find({
            where: { user: { id: uid } },
            relations: { tasks: true },
        });
    }

    async getProjectById(uid:number, id: number) {
        const project = await this.projectRepository.findOne({
            where: { id, user: { id: uid } },
            relations: { tasks: true },
        });

        if (!project) {
            throw new ResourceNotFoundException('Project', id);
        }

        return project;
    }

    async createProject(uid:number, project: CreateProjectDto) {
        const newProject = this.projectRepository.create({
            title: project.title,
            user: {
                id: uid
            }
        });

        return await this.projectRepository.save(newProject);
    }

    async updateProject(uid:number, id: number, project: UpdateProjectDto) {
        const existingProject = await this.getProjectById(uid, id);

        this.projectRepository.merge(existingProject, project);

        return await this.projectRepository.save(existingProject);
    }

    async deleteProject(uid:number, id: number) {
        await this.getProjectById(uid, id);

        await this.projectRepository.delete({ id });

        return { id, deleted: true };
    }
}
