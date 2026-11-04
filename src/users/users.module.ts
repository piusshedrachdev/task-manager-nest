import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from './entities/users.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
