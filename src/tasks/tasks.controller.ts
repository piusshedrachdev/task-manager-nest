import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dto/task.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../utils/interface/interface.js';
import { DeleteResponseDto } from '../common/dto/error-response.dto.js';
import {
  ApiNotFoundError,
  ApiUnauthorizedError,
  ApiValidationError,
} from '../common/swagger/api-error-responses.js';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
  @ApiOkResponse({ type: [TaskResponseDto], description: 'Tasks owned by the caller' })
  @ApiUnauthorizedError()
  getAllTasks(@Req() req: AuthenticatedRequest) {
    return this.service.getAllTasks(req.user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Task ID' })
  @ApiOkResponse({ type: TaskResponseDto })
  @ApiValidationError('The id parameter must be a positive integer')
  @ApiUnauthorizedError()
  @ApiNotFoundError('Task not found for this user')
  getTaskById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.service.getTaskById(req.user?.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({ type: TaskResponseDto, description: 'Task created' })
  @ApiValidationError()
  @ApiUnauthorizedError()
  @ApiNotFoundError('Project not found for this user')
  createTask(
    @Req() req: AuthenticatedRequest,
    @Body() task: CreateTaskDto,
  ) {
    return this.service.createTask(req, task);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', example: 1, description: 'Task ID' })
  @ApiOkResponse({ type: TaskResponseDto, description: 'Task updated' })
  @ApiValidationError()
  @ApiUnauthorizedError()
  @ApiNotFoundError('Task not found for this user')
  updateTask(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIdPipe) id: number,
    @Body() task: UpdateTaskDto,
  ) {
    return this.service.updateTask(req.user?.id, id, task);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', example: 1, description: 'Task ID' })
  @ApiOkResponse({ type: DeleteResponseDto, description: 'Task deleted' })
  @ApiValidationError('The id parameter must be a positive integer')
  @ApiUnauthorizedError()
  @ApiNotFoundError('Task not found for this user')
  deleteTask(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.service.deleteTask(req.user?.id, id);
  }
}
