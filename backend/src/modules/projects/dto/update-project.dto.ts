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

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @IsOptional()
  @IsEnum(ProjectStandard)
  standard?: ProjectStandard;

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
