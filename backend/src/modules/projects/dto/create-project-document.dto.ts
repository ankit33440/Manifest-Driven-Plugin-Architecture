import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreateProjectDocumentDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsUrl()
  url!: string;

  @IsString()
  type!: string;
}
