import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateTaskDto, UpdateTaskDto } from './task.dto.js';

describe('CreateTaskDto', () => {
  it('accepts a valid payload and trims the title', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: '  Complete the assignment  ',
      description: 'Description',
      projectId: 1,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.title).toBe('Complete the assignment');
  });

  it('rejects an empty title and a non-positive project id', async () => {
    const errors = await validate(
      plainToInstance(CreateTaskDto, {
        title: '   ',
        projectId: 0,
      }),
    );

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['title', 'projectId']),
    );
  });
});

describe('UpdateTaskDto', () => {
  it('accepts a partial update with a valid status', async () => {
    const errors = await validate(
      plainToInstance(UpdateTaskDto, { status: 'completed' }),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const errors = await validate(
      plainToInstance(UpdateTaskDto, { status: 'not-a-status' }),
    );

    expect(errors.map((error) => error.property)).toContain('status');
  });

  it('rejects a whitespace-only title when one is supplied', async () => {
    const errors = await validate(
      plainToInstance(UpdateTaskDto, { title: '   ' }),
    );

    expect(errors.map((error) => error.property)).toContain('title');
  });
});
