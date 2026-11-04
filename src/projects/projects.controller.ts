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

import {
    CreateProjectDto,
    ProjectResponseDto,
    UpdateProjectDto,
} from './dto/project.dto.js';
import { ProjectsService } from './projects.service.js';

import { AuthGuard } from '../auth/auth.guard.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { DeleteResponseDto } from '../common/dto/error-response.dto.js';
import {
    ApiNotFoundError,
    ApiUnauthorizedError,
    ApiValidationError,
} from '../common/swagger/api-error-responses.js';
import type { AuthenticatedRequest } from '../utils/interface/interface.js';

import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProjectsController {
    constructor(private readonly service: ProjectsService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    @ApiOperation({ summary: 'Get all projects for the authenticated user' })
    @ApiOkResponse({
        type: [ProjectResponseDto],
        description: 'Projects owned by the caller, including their tasks',
    })
    @ApiUnauthorizedError()
    getAllProjects(@Req() req: AuthenticatedRequest) {
        return this.service.getAllProjects(req.user?.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a project by id' })
    @ApiParam({ name: 'id', example: 1, description: 'Project ID' })
    @ApiOkResponse({ type: ProjectResponseDto })
    @ApiValidationError('The id parameter must be a positive integer')
    @ApiUnauthorizedError()
    @ApiNotFoundError('Project not found for this user')
    getProjectById(
        @Req() req: AuthenticatedRequest,
        @Param('id', ParseIdPipe) id: number,
    ) {
        return this.service.getProjectById(req.user?.id, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiCreatedResponse({
        type: ProjectResponseDto,
        description: 'Project created',
    })
    @ApiValidationError()
    @ApiUnauthorizedError()
    createProject(
        @Req() req: AuthenticatedRequest,
        @Body() project: CreateProjectDto,
    ) {
        return this.service.createProject(req.user?.id, project);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a project' })
    @ApiParam({ name: 'id', example: 1, description: 'Project ID' })
    @ApiOkResponse({ type: ProjectResponseDto, description: 'Project updated' })
    @ApiValidationError()
    @ApiUnauthorizedError()
    @ApiNotFoundError('Project not found for this user')
    updateProject(
        @Req() req: AuthenticatedRequest,
        @Param('id', ParseIdPipe) id: number,
        @Body() project: UpdateProjectDto,
    ) {
        return this.service.updateProject(req.user?.id, id, project);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project' })
    @ApiParam({ name: 'id', example: 1, description: 'Project ID' })
    @ApiOkResponse({ type: DeleteResponseDto, description: 'Project deleted' })
    @ApiValidationError('The id parameter must be a positive integer')
    @ApiUnauthorizedError()
    @ApiNotFoundError('Project not found for this user')
    deleteProject(
        @Req() req: AuthenticatedRequest,
        @Param('id', ParseIdPipe) id: number,
    ) {
        return this.service.deleteProject(req.user?.id, id);
    }
}
