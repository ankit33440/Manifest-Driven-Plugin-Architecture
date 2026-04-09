import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreditsService } from './credits.service';
import { IssueCreditDto } from './dto/issue-credit.dto';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  findAll() {
    return this.creditsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditsService.findOne(id);
  }

  @Post()
  issue(@Body() dto: IssueCreditDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.creditsService.issue(dto, user?.id || 'unknown');
  }

  @Patch(':id/retire')
  retire(@Param('id') id: string) {
    return this.creditsService.retire(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsService.remove(id);
  }
}
