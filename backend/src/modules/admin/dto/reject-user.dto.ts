import { IsOptional, IsString } from 'class-validator';

export class RejectUserDto {
  @IsOptional()
  @IsString()
  note?: string;
}
