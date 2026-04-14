import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewDecisionDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}
