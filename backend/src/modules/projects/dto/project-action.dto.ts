import { IsOptional, IsString } from 'class-validator';

export class ProjectActionDto {
  @IsOptional()
  @IsString()
  note?: string;
}
