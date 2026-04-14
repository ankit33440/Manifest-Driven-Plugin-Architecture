import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class AuditFilterDto {
  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
