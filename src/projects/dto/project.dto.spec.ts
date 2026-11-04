import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateProjectDto, UpdateProjectDto } from './project.dto.js';

describe('CreateProjectDto', () => {
  it('accepts a valid title and trims it', async () => {
    const dto = plainToInstance(CreateProjectDto, {
      title: '  Task Management System  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.title).toBe('Task Management System');
  });

  it('rejects an empty title', async () => {
    const errors = await validate(
      plainToInstance(CreateProjectDto, { title: '   ' }),
    );

    expect(errors.map((error) => error.property)).toContain('title');
  });
});

describe('UpdateProjectDto', () => {
  it('allows an empty update payload', async () => {
    await expect(
      validate(plainToInstance(UpdateProjectDto, {})),
    ).resolves.toHaveLength(0);
  });
});
