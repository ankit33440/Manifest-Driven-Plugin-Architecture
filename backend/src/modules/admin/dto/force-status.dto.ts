import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '../../../database/entities/project.entity';

export class ForceStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
