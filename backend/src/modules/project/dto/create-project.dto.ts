import { IsEnum, IsString, MinLength } from 'class-validator';

export enum ProjectType {
  REFORESTATION = 'REFORESTATION',
  SOIL_CARBON = 'SOIL_CARBON',
  RENEWABLE_ENERGY = 'RENEWABLE_ENERGY',
  METHANE_CAPTURE = 'METHANE_CAPTURE',
}

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsString()
  @MinLength(2)
  location: string;

  @IsString()
  @MinLength(10)
  description: string;
}
