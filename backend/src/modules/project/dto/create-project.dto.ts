import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Max,
} from 'class-validator';

export class CreateProjectDto {
  // ── Required ──────────────────────────────────────────────────────────────────

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  // ── Optional UI fields ────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  projectProponent?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  enrollment?: string;

  @IsOptional()
  @IsString()
  protocol?: string;

  @IsOptional()
  @IsString()
  protocolVersion?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  applicationYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  vintage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedCarbonCredits?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageAccrualRate?: number;

  // ── Location: user-provided ───────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  geocodedAddress?: string;

  // ── Internal / system-managed (accepted on create but not user-exposed) ───────
  // These are preserved for geospatial/backend logic but must not be listed
  // as required form fields. They are populated by geocoding or admin services.

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
  @Min(0)
  areaHectares?: number;
}
