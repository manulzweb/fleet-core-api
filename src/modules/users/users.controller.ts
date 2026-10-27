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

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@User('id') id: string) {
    return this.users.getById(id);
  }

  @Roles(RoleCode.ADMIN)
  @Get()
  list(@Query() q: PaginationQueryDto) {
    return this.users.list(q);
  }

  @Roles(RoleCode.ADMIN)
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.getById(id);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.users.setStatus(id, dto.isActive);
  }
}
