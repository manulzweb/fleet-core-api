// src/modules/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, User } from '../../common/decorators/index.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { RoleCode } from '../../common/enums/index.js';
import { UpdateUserDto } from './dto/user-update.dto.js';
import { UpdateUserStatusDto } from './dto/user-update-status.dto.js';
import { UsersService } from './users.service.js';

/** User administration and current-user profile endpoints. */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Returns the authenticated user's own profile (any role). */
  @Get('me')
  me(@User('id') id: string) {
    return this.users.getById(id);
  }

  /** Lists users, paginated (ADMIN only). */
  @Roles(RoleCode.ADMIN)
  @Get()
  list(@Query() q: PaginationQueryDto) {
    return this.users.list(q);
  }

  /** Gets a user by id (ADMIN only). */
  @Roles(RoleCode.ADMIN)
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.getById(id);
  }

  /** Updates a user's name and/or role (ADMIN only). */
  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  /** Activates or deactivates a user (ADMIN only). */
  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.users.setStatus(id, dto.isActive);
  }
}
