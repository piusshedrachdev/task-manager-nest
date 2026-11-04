import { ParseIdPipe } from './parse-id.pipe.js';
import { ValidationException } from '../errors/app.exception.js';

describe('ParseIdPipe', () => {
  const pipe = new ParseIdPipe();

  it('converts a positive integer string to a number', () => {
    expect(pipe.transform('42')).toBe(42);
  });

  it.each(['0', '-1', 'abc', '1.5', ''])(
    'rejects the invalid id %s',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(ValidationException);
    },
  );
});
