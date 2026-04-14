import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateChecklistDto {
  @IsBoolean()
  @IsOptional()
  methodologyCheck?: boolean;

  @IsBoolean()
  @IsOptional()
  boundaryCheck?: boolean;

  @IsBoolean()
  @IsOptional()
  additionalityCheck?: boolean;

  @IsBoolean()
  @IsOptional()
  permanenceCheck?: boolean;
}
