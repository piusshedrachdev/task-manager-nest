import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
    Req,
} from '@nestjs/common';

import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto.js';
import { ProjectsService } from './projects.service.js';

import {AuthGuard} from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../utils/interface/interface.js';


import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('projects')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProjectsController {
    constructor(private readonly service: ProjectsService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    @ApiOperation({ summary: 'Get all projects for the authenticated user' })
    getAllProjects(@Req() req:AuthenticatedRequest) {
        return this.service.getAllProjects(req.user?.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a project by id' })
    getProjectById(@Req() req:AuthenticatedRequest, @Param('id') id: number) {
        return this.service.getProjectById(req.user?.id, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    createProject(@Req() req:AuthenticatedRequest, @Body() project: CreateProjectDto) {
        return this.service.createProject(req.user?.id, project);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a project' })
    updateProject(@Req() req:AuthenticatedRequest, @Param('id') id: number, @Body() project: UpdateProjectDto) {
        return this.service.updateProject(req.user?.id, id, project);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project' })
    deleteProject(@Req() req:AuthenticatedRequest, @Param('id') id: number) {
        return this.service.deleteProject(req.user?.id, id);
    }
}
