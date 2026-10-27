import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDao } from './dao/user.dao.js';
import { Role } from './entities/role.entity.js';
import { UserEntity } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Role])],
  controllers: [UsersController],
  providers: [UsersService, UserDao],
  exports: [UsersService],
})
export class UsersModule {}
