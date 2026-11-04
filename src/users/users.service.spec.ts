import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from './users.service.js';
import { Users } from './entities/users.entity.js';
import { DuplicateResourceException } from '../common/errors/app.exception.js';

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: usersRepositoryMock,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects registration when the email already exists', async () => {
    usersRepositoryMock.findOne.mockResolvedValue({ id: 1 });

    await expect(
      service.registerUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(DuplicateResourceException);
  });
});
