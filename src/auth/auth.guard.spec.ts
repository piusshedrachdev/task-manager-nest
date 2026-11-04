import { ConfigService } from '@nestjs/config';

import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  it('should be defined', () => {
    const configService = {
      getOrThrow: vi.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    expect(new AuthGuard(configService)).toBeDefined();
  });
});
