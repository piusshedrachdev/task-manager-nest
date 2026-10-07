import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TasksService } from './tasks.service.js';
import { DbService } from '../db/db.service.js';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: DbService,
          useValue: { read: vi.fn(), write: vi.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: vi.fn().mockReturnValue('tasks.json') },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
