import { ProjectStandard, ProjectType } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(ProjectType)
  type!: ProjectType;

  @IsEnum(ProjectStandard)
  standard!: ProjectStandard;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

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
  @IsNumber()
  @Min(1900)
  @Max(3000)
  vintageStartYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(3000)
  vintageEndYear?: number;
}
