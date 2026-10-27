// src/modules/users/mapper/user.mapper.ts
import { RoleCode } from '../../../common/enums/index.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { UserEntity } from '../entities/user.entity.js';

/** Maps user entities to response DTOs. */
export const UserMapper = {
  toResponse(u: UserEntity): UserResponseDto {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.code as RoleCode,
      isActive: u.isActive,
    };
  },
};
