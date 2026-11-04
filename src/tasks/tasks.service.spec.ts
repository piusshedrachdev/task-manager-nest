import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TasksService } from './tasks.service.js';
import { Task } from './entities/task.entity.js';
import { Projects } from '../projects/entity/project.entity.js';
import { ResourceNotFoundException } from '../common/errors/app.exception.js';
import type { AuthenticatedRequest } from '../utils/interface/interface.js';

describe('TasksService', () => {
  let service: TasksService;

  const taskRepositoryMock = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    merge: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const projectRepositoryMock = {
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepositoryMock,
        },
        {
          provide: getRepositoryToken(Projects),
          useValue: projectRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects task creation for a project the user does not own', async () => {
    projectRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.createTask(
        { user: { id: 1 } } as AuthenticatedRequest,
        { title: 'Task', description: 'Description', projectId: 99 },
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it('rejects updates for a task the user does not own', async () => {
    taskRepositoryMock.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateTask(1, 99, { title: 'Updated' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });
});
