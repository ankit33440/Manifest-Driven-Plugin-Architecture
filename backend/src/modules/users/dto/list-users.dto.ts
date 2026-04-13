import { IsOptional, IsString } from 'class-validator';

export class ListUsersDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
