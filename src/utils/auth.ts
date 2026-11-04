import jwt from 'jsonwebtoken';
import { UserIdentityDto } from '../users/dto/users.dto.js';

export function createJWT(user: UserIdentityDto, secret: string) {
  return jwt.sign(user, secret, {
    expiresIn: '1h',
  });
}