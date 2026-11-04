import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UsersService } from './users.service.js';
import {
  ChangeRoleResponseDto,
  CreateUserDto,
  LoginDto,
  UserProfileDto,
} from './dto/users.dto.js';

import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../utils/interface/interface.js';
import { ForbiddenOperationException } from '../common/errors/app.exception.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { MessageResponseDto } from '../common/dto/error-response.dto.js';
import {
  ApiConflictError,
  ApiForbiddenError,
  ApiNotFoundError,
  ApiUnauthorizedError,
  ApiValidationError,
} from '../common/swagger/api-error-responses.js';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiCreatedResponse({ type: MessageResponseDto, description: 'Account created' })
  @ApiValidationError()
  @ApiConflictError('An account with this email already exists')
  async register(@Body() createUserPayload: CreateUserDto) {
    return this.usersService.registerUser(createUserPayload);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'Signed JWT access token',
    schema: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  @ApiValidationError()
  @ApiUnauthorizedError('Invalid email or password')
  async login(@Body() loginCred: LoginDto) {
    return this.usersService.loginUser(loginCred);
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Change a user role to admin' })
  @ApiParam({ name: 'id', example: 1, description: 'Target user ID' })
  @ApiOkResponse({ type: ChangeRoleResponseDto, description: 'Role updated' })
  @ApiValidationError()
  @ApiUnauthorizedError()
  @ApiForbiddenError('Admin access required')
  @ApiNotFoundError('User not found')
  async makeUserAdmin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIdPipe) targetUserId: number,
  ) {

    if (req.user?.role !== 'admin') {
      throw new ForbiddenOperationException('Admin access required');
    }

    return await this.usersService.changeUserRole(targetUserId);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  @ApiOkResponse({
    type: UserProfileDto,
    description: 'Authenticated user profile (never includes the password)',
  })
  @ApiUnauthorizedError()
  @ApiNotFoundError('User not found')
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user?.id);
  }
}