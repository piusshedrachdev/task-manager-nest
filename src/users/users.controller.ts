import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Get,
  ForbiddenException,
} from '@nestjs/common';

import { UsersService } from './users.service.js';
import { CreateUserDto, LoginDto } from './dto/users.dto.js';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../utils/interface/interface.js';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  async register(@Body() createUserPayload: CreateUserDto) {
    return this.usersService.registerUser(createUserPayload);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginCred: LoginDto) {
    return this.usersService.loginUser(loginCred);
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change a user role to admin' })
  async makeUserAdmin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) targetUserId: number,
  ) {

    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return await this.usersService.changeUserRole(targetUserId);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth() 
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user?.id);
  }
}