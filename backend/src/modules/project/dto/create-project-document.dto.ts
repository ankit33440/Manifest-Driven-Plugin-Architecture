import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProjectDocumentDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  type?: string;
}
