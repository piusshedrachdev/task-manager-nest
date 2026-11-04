import type { ValidationError } from 'class-validator';

import { flattenValidationErrors } from './validation.pipe.js';

describe('flattenValidationErrors', () => {
  it('flattens nested validation errors into field/message pairs', () => {
    const errors = [
      {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
        children: [],
      },
      {
        property: 'project',
        constraints: {},
        children: [
          {
            property: 'title',
            constraints: { isNotEmpty: 'title should not be empty' },
            children: [],
          },
        ],
      },
    ] as unknown as ValidationError[];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'email', message: 'email must be an email' },
      { field: 'project.title', message: 'title should not be empty' },
    ]);
  });
});
