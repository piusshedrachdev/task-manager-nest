import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity.js';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginDto, UserIdentityDto } from './dto/users.dto.js';
import { createJWT } from '../utils/auth.js';
import {
  DuplicateResourceException,
  InvalidCredentialsException,
  ResourceNotFoundException,
} from '../common/errors/app.exception.js';

import { hash, compare } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new DuplicateResourceException(
        'An account with this email already exists',
      );
    }

    const password = await hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      name: createUserDto.name.trim(),
      email,
      password,
    });

    await this.usersRepository.save(user);

    return { message: 'Account created successfully.' };
  }

  async loginUser(loginCred: LoginDto) {
    const email = loginCred.email.trim().toLowerCase();

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await compare(loginCred.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const userIdentity: UserIdentityDto = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');

    return createJWT(userIdentity, secret);
  }

  async changeUserRole(targetUserId: number) {
    const user = await this.usersRepository.findOneBy({ id: targetUserId });

    if (!user) {
      throw new ResourceNotFoundException('User', targetUserId);
    }

    await this.usersRepository.update(targetUserId, { role: 'admin' });

    return { id: targetUserId, role: 'admin' };
  }

  async getProfile(uid: number) {
    const user = await this.usersRepository.findOneBy({ id: uid });

    if (!user) {
      throw new ResourceNotFoundException('User', uid);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
