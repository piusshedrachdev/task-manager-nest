import { Test, TestingModule } from '@nestjs/testing';

import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            getAllProjects: vi.fn(),
            getProjectById: vi.fn(),
            createProject: vi.fn(),
            updateProject: vi.fn(),
            deleteProject: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
