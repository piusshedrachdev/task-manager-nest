import { Test, TestingModule } from '@nestjs/testing';

import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            getAllTasks: vi.fn(),
            getTaskById: vi.fn(),
            createTask: vi.fn(),
            updateTask: vi.fn(),
            deleteTask: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
