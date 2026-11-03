import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from '../utils/interface/interface.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const token = authHeader.slice(7);

    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');

      const decoded = jwt.verify(token, secret);

      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Attach decoded payload to request
      req.user = decoded;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}