import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CertifyProjectDto {
  @IsNumber()
  @Min(1)
  creditVolume: number;

  @IsString()
  @IsNotEmpty()
  serialNumberStart: string;

  @IsString()
  @IsNotEmpty()
  serialNumberEnd: string;

  @IsString()
  @IsNotEmpty()
  note: string;
}
