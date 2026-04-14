import { IsEnum } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class ChangeUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
