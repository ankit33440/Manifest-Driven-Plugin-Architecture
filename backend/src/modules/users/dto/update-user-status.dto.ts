import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
