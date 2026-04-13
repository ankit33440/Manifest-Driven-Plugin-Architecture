import { IsOptional, IsString } from 'class-validator';

export class ListProjectsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
