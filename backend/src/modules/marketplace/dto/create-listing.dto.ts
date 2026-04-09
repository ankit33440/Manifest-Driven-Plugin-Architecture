import { IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateListingDto {
  @IsString()
  creditId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  pricePerTonne: number;
}
