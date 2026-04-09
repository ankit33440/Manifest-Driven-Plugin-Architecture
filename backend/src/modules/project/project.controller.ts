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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.projectService.create(dto, user?.id || 'unknown');
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string) {
    return this.projectService.submit(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.projectService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.projectService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
