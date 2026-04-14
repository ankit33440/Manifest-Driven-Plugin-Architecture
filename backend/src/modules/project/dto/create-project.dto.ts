import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  ProjectStandard,
  ProjectType,
} from '../../../database/entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsEnum(ProjectStandard)
  standard: ProjectStandard;

  @IsString()
  country: string;

  @IsString()
  region: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  areaHectares?: number;

  @IsOptional()
  @IsNumber()
  estimatedCredits?: number;

  @IsOptional()
  @IsInt()
  vintageStartYear?: number;

  @IsOptional()
  @IsInt()
  vintageEndYear?: number;
}
