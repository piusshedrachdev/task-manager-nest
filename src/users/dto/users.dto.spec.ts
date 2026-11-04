import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateUserDto, LoginDto } from './users.dto.js';

describe('CreateUserDto', () => {
  it('accepts a valid payload and normalizes its fields', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: '  Jane Doe  ',
      email: '  JANE@Example.com ',
      password: 'Password123',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Jane Doe');
    expect(dto.email).toBe('jane@example.com');
  });

  it('rejects an invalid email and a weak password', async () => {
    const errors = await validate(
      plainToInstance(CreateUserDto, {
        name: 'Jane Doe',
        email: 'not-an-email',
        password: 'short',
      }),
    );

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
  });

  it('rejects a whitespace-only name', async () => {
    const errors = await validate(
      plainToInstance(CreateUserDto, {
        name: '   ',
        email: 'jane@example.com',
        password: 'Password123',
      }),
    );

    expect(errors.map((error) => error.property)).toContain('name');
  });
});

describe('LoginDto', () => {
  it('normalizes the email before validation', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  JANE@Example.com ',
      password: 'Password123',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.email).toBe('jane@example.com');
  });

  it('rejects an empty password', async () => {
    const errors = await validate(
      plainToInstance(LoginDto, {
        email: 'jane@example.com',
        password: '',
      }),
    );

    expect(errors.map((error) => error.property)).toContain('password');
  });
});
