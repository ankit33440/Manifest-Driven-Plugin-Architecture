import { IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IssueCreditDto {
  @IsString()
  projectId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  carbonTonnes: number;

  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  vintageYear: number;

  projectName?: string;
}
