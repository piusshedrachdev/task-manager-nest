import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import request from 'supertest';
import { QueryFailedError } from 'typeorm';
import { App } from 'supertest/types.js';

import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { createValidationPipe } from '../src/common/pipes/validation.pipe.js';
import { Projects } from '../src/projects/entity/project.entity.js';
import { ProjectsController } from '../src/projects/projects.controller.js';
import { ProjectsService } from '../src/projects/projects.service.js';
import { Task } from '../src/tasks/entities/task.entity.js';
import { TasksController } from '../src/tasks/tasks.controller.js';
import { TasksService } from '../src/tasks/tasks.service.js';
import { Users } from '../src/users/entities/users.entity.js';
import { UsersController } from '../src/users/users.controller.js';
import { UsersService } from '../src/users/users.service.js';
import { createJWT } from '../src/utils/auth.js';

const JWT_SECRET = 'e2e-test-secret';
const PASSWORD = 'Password123';

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string;
}

interface StoredProject {
  id: number;
  title: string;
  user: { id: number };
  tasks: StoredTask[];
}

interface StoredTask {
  id: number;
  title: string;
  description?: string;
  status: string;
  project: { id: number };
}

const users: StoredUser[] = [];
const projects: StoredProject[] = [];
const tasks: StoredTask[] = [];

let nextUserId = 1;
let nextProjectId = 1;
let nextTaskId = 1;

let passwordHash = '';
let userToken = '';
let adminToken = '';
let otherToken = '';

const usersRepository = {
  findOne: vi.fn(
    async ({ where }: { where: { email?: string; id?: number } }) => {
      if (where.email !== undefined) {
        return users.find((user) => user.email === where.email) ?? null;
      }

      if (where.id !== undefined) {
        return users.find((user) => user.id === where.id) ?? null;
      }

      return null;
    },
  ),
  findOneBy: vi.fn(
    async ({ id }: { id: number }) =>
      users.find((user) => user.id === id) ?? null,
  ),
  create: vi.fn((data: Pick<StoredUser, 'name' | 'email' | 'password'>) => ({
    id: nextUserId++,
    role: 'user',
    ...data,
  })),
  save: vi.fn(async (user: StoredUser) => {
    const index = users.findIndex((candidate) => candidate.id === user.id);

    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }

    return user;
  }),
  update: vi.fn(async (id: number, patch: Partial<StoredUser>) => {
    const user = users.find((candidate) => candidate.id === id);

    if (!user) {
      return { affected: 0 };
    }

    Object.assign(user, patch);

    return { affected: 1 };
  }),
};

const projectsRepository = {
  find: vi.fn(async ({ where }: { where: { user: { id: number } } }) =>
    projects
      .filter((project) => project.user.id === where.user.id)
      .map((project) => ({
        ...project,
        tasks: tasks.filter((task) => task.project.id === project.id),
      })),
  ),
  findOne: vi.fn(
    async ({
      where,
    }: {
      where: { id: number; user: { id: number } };
    }) => {
      const project = projects.find(
        (candidate) =>
          candidate.id === where.id && candidate.user.id === where.user.id,
      );

      if (!project) {
        return null;
      }

      return {
        ...project,
        tasks: tasks.filter((task) => task.project.id === project.id),
      };
    },
  ),
  create: vi.fn((data: { title: string; user: { id: number } }) => ({
    id: nextProjectId++,
    title: data.title,
    user: data.user,
    tasks: [],
  })),
  merge: vi.fn((target: StoredProject, patch: Partial<StoredProject>) =>
    Object.assign(target, patch),
  ),
  save: vi.fn(async (project: StoredProject) => {
    const index = projects.findIndex(
      (candidate) => candidate.id === project.id,
    );

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    return project;
  }),
  delete: vi.fn(async ({ id }: { id: number }) => {
    const index = projects.findIndex((project) => project.id === id);

    if (index >= 0) {
      projects.splice(index, 1);
    }

    return { affected: index >= 0 ? 1 : 0 };
  }),
};

const projectOwnerId = (projectId: number) =>
  projects.find((project) => project.id === projectId)?.user.id;

const tasksRepository = {
  find: vi.fn(
    async ({ where }: { where: { project: { user: { id: number } } } }) =>
      tasks.filter(
        (task) => projectOwnerId(task.project.id) === where.project.user.id,
      ),
  ),
  findOneBy: vi.fn(
    async ({
      id,
      project,
    }: {
      id: number;
      project: { user: { id: number } };
    }) =>
      tasks.find(
        (task) =>
          task.id === id &&
          projectOwnerId(task.project.id) === project.user.id,
      ) ?? null,
  ),
  create: vi.fn(
    (data: {
      title: string;
      description?: string;
      project: { id: number };
    }) => ({
      id: nextTaskId++,
      title: data.title,
      description: data.description,
      status: 'todo',
      project: data.project,
    }),
  ),
  merge: vi.fn((target: StoredTask, patch: Partial<StoredTask>) =>
    Object.assign(target, patch),
  ),
  save: vi.fn(async (task: StoredTask) => {
    const index = tasks.findIndex((candidate) => candidate.id === task.id);

    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }

    return task;
  }),
  delete: vi.fn(async ({ id }: { id: number }) => {
    const index = tasks.findIndex((task) => task.id === id);

    if (index >= 0) {
      tasks.splice(index, 1);
    }

    return { affected: index >= 0 ? 1 : 0 };
  }),
};

function seedData() {
  users.length = 0;
  projects.length = 0;
  tasks.length = 0;

  nextUserId = 4;
  nextProjectId = 1;
  nextTaskId = 1;

  users.push(
    {
      id: 1,
      name: 'Test User',
      email: 'user@example.com',
      role: 'user',
      password: passwordHash,
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      password: passwordHash,
    },
    {
      id: 3,
      name: 'Other User',
      email: 'other@example.com',
      role: 'user',
      password: passwordHash,
    },
  );
}

describe('Task Manager API (e2e)', () => {
  let app: INestApplication<App>;

  const server = () => request(app.getHttpServer());
  const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  const createProject = async (token = userToken, title = 'Project') => {
    const response = await server()
      .post('/projects')
      .set(authHeader(token))
      .send({ title })
      .expect(201);

    return response.body as { id: number; title: string };
  };

  const createTask = async (projectId: number, token = userToken) => {
    const response = await server()
      .post('/tasks')
      .set(authHeader(token))
      .send({ title: 'Task', projectId })
      .expect(201);

    return response.body as { id: number };
  };

  beforeAll(async () => {
    passwordHash = await hash(PASSWORD, 4);

    userToken = createJWT(
      {
        id: 1,
        name: 'Test User',
        email: 'user@example.com',
        role: 'user',
      },
      JWT_SECRET,
    );

    adminToken = createJWT(
      {
        id: 2,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
      JWT_SECRET,
    );

    otherToken = createJWT(
      {
        id: 3,
        name: 'Other User',
        email: 'other@example.com',
        role: 'user',
      },
      JWT_SECRET,
    );

    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController, ProjectsController, TasksController],
      providers: [
        UsersService,
        ProjectsService,
        TasksService,
        {
          provide: getRepositoryToken(Users),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Projects),
          useValue: projectsRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: tasksRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () => JWT_SECRET,
            get: () => undefined,
          },
        },
        {
          provide: APP_PIPE,
          useFactory: createValidationPipe,
        },
        {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    seedData();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  describe('Registration and validation', () => {
    it('creates an account and normalizes its fields', async () => {
      const response = await server()
        .post('/users/register')
        .send({
          name: '  New User  ',
          email: '  NEW@Example.com ',
          password: PASSWORD,
        })
        .expect(201);

      expect(response.body).toEqual({
        message: 'Account created successfully.',
      });

      const created = users.find((user) => user.email === 'new@example.com');
      expect(created?.name).toBe('New User');
      expect(created?.password).not.toBe(PASSWORD);
    });

    it('rejects duplicate emails with 409', async () => {
      const response = await server()
        .post('/users/register')
        .send({
          name: 'Another User',
          email: 'user@example.com',
          password: PASSWORD,
        })
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        statusCode: 409,
        code: 'DUPLICATE_RESOURCE',
      });
    });

    it('returns structured validation errors', async () => {
      const response = await server()
        .post('/users/register')
        .send({
          name: 'A',
          email: 'not-an-email',
          password: 'weak',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      });
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
        ]),
      );
    });

    it('rejects unknown properties', async () => {
      const response = await server()
        .post('/users/register')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: PASSWORD,
          isAdmin: true,
        })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'isAdmin' }),
        ]),
      );
    });

    it('maps a database unique violation to 409', async () => {
      usersRepository.save.mockRejectedValueOnce(
        new QueryFailedError(
          'INSERT INTO users',
          [],
          Object.assign(new Error('duplicate key'), { code: '23505' }),
        ),
      );

      const response = await server()
        .post('/users/register')
        .send({
          name: 'New User',
          email: 'unique@example.com',
          password: PASSWORD,
        })
        .expect(409);

      expect(response.body.code).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('Login', () => {
    it('returns a JWT for valid credentials', async () => {
      const response = await server()
        .post('/users/login')
        .send({
          email: '  USER@Example.com ',
          password: PASSWORD,
        })
        .expect(200);

      expect(response.text.split('.')).toHaveLength(3);
    });

    it('rejects a wrong password with 401', async () => {
      const response = await server()
        .post('/users/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword1',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('rejects an unknown email with 401', async () => {
      const response = await server()
        .post('/users/login')
        .send({
          email: 'missing@example.com',
          password: PASSWORD,
        })
        .expect(401);

      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects an empty password with 400', async () => {
      const response = await server()
        .post('/users/login')
        .send({
          email: 'user@example.com',
          password: '',
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ]),
      );
    });
  });

  describe('Profile and authorization', () => {
    it('requires authentication', async () => {
      const response = await server().get('/users/profile').expect(401);

      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
        code: 'UNAUTHORIZED',
        path: '/users/profile',
        method: 'GET',
      });
    });

    it('rejects an invalid token', async () => {
      const response = await server()
        .get('/users/profile')
        .set('Authorization', 'Bearer not-a-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('returns the authenticated profile without a password', async () => {
      const response = await server()
        .get('/users/profile')
        .set(authHeader(userToken))
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        name: 'Test User',
        email: 'user@example.com',
        role: 'user',
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('returns 404 when the token user no longer exists', async () => {
      const token = createJWT(
        {
          id: 999,
          name: 'Deleted User',
          email: 'deleted@example.com',
          role: 'user',
        },
        JWT_SECRET,
      );

      const response = await server()
        .get('/users/profile')
        .set(authHeader(token))
        .expect(404);

      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('forbids non-admins from changing roles', async () => {
      const response = await server()
        .patch('/users/3/role')
        .set(authHeader(userToken))
        .expect(403);

      expect(response.body).toMatchObject({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Admin access required',
      });
    });

    it('allows an admin to change a role', async () => {
      const response = await server()
        .patch('/users/3/role')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body).toEqual({ id: 3, role: 'admin' });
      expect(users.find((user) => user.id === 3)?.role).toBe('admin');
    });

    it('validates the id parameter', async () => {
      const response = await server()
        .patch('/users/not-a-number/role')
        .set(authHeader(adminToken))
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'id' }),
        ]),
      );
    });
  });

  describe('Projects', () => {
    it('creates and lists projects for the authenticated user', async () => {
      const created = await createProject(userToken, '  Project A  ');
      expect(created).toMatchObject({ id: 1, title: 'Project A' });

      const response = await server()
        .get('/projects')
        .set(authHeader(userToken))
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ id: 1, title: 'Project A' });
    });

    it('rejects an empty title', async () => {
      const response = await server()
        .post('/projects')
        .set(authHeader(userToken))
        .send({ title: '   ' })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'title' }),
        ]),
      );
    });

    it('rejects an invalid id parameter', async () => {
      const response = await server()
        .get('/projects/abc')
        .set(authHeader(userToken))
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for an unknown project', async () => {
      const response = await server()
        .get('/projects/999')
        .set(authHeader(userToken))
        .expect(404);

      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('updates and deletes a project', async () => {
      const project = await createProject();

      const updated = await server()
        .put(`/projects/${project.id}`)
        .set(authHeader(userToken))
        .send({ title: 'Updated Project' })
        .expect(200);

      expect(updated.body.title).toBe('Updated Project');

      const deleted = await server()
        .delete(`/projects/${project.id}`)
        .set(authHeader(userToken))
        .expect(200);

      expect(deleted.body).toEqual({ id: project.id, deleted: true });

      await server()
        .get(`/projects/${project.id}`)
        .set(authHeader(userToken))
        .expect(404);
    });
  });

  describe('Tasks', () => {
    it('creates and lists tasks for the authenticated user', async () => {
      const project = await createProject();

      const created = await server()
        .post('/tasks')
        .set(authHeader(userToken))
        .send({
          title: '  Task A  ',
          description: 'Description',
          projectId: project.id,
        })
        .expect(201);

      expect(created.body).toMatchObject({
        title: 'Task A',
        description: 'Description',
        status: 'todo',
      });

      const response = await server()
        .get('/tasks')
        .set(authHeader(userToken))
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: created.body.id,
        title: 'Task A',
      });
    });

    it('rejects task creation for another user project', async () => {
      const project = await createProject(otherToken, 'Other Project');

      const response = await server()
        .post('/tasks')
        .set(authHeader(userToken))
        .send({ title: 'Task', projectId: project.id })
        .expect(404);

      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('rejects an empty title and a non-positive project id', async () => {
      const response = await server()
        .post('/tasks')
        .set(authHeader(userToken))
        .send({ title: '   ', projectId: 0 })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'title' }),
          expect.objectContaining({ field: 'projectId' }),
        ]),
      );
    });

    it('updates and deletes a task', async () => {
      const project = await createProject();
      const task = await createTask(project.id);

      const updated = await server()
        .patch(`/tasks/${task.id}`)
        .set(authHeader(userToken))
        .send({ status: 'completed' })
        .expect(200);

      expect(updated.body.status).toBe('completed');

      const deleted = await server()
        .delete(`/tasks/${task.id}`)
        .set(authHeader(userToken))
        .expect(200);

      expect(deleted.body).toEqual({ id: task.id, deleted: true });

      await server()
        .get(`/tasks/${task.id}`)
        .set(authHeader(userToken))
        .expect(404);
    });

    it('rejects an invalid status', async () => {
      const project = await createProject();
      const task = await createTask(project.id);

      const response = await server()
        .patch(`/tasks/${task.id}`)
        .set(authHeader(userToken))
        .send({ status: 'not-a-status' })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'status' }),
        ]),
      );
    });
  });

  describe('Unknown routes', () => {
    it('returns the standard 404 envelope', async () => {
      const response = await server().get('/does-not-exist').expect(404);

      expect(response.body).toMatchObject({
        success: false,
        statusCode: 404,
        code: 'NOT_FOUND',
        path: '/does-not-exist',
        method: 'GET',
      });
    });
  });
});
