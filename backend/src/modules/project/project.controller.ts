import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@Controller('projects')
@UseInterceptors(AuditInterceptor)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.projectService.findAll(user?.id, user?.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.projectService.create(dto, user?.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.projectService.update(id, dto, user?.id);
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.projectService.submit(id, user?.id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.projectService.approve(id, user?.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.projectService.reject(id, user?.id, body?.note);
  }

  @Post(':id/documents')
  addDocument(
    @Param('id') id: string,
    @Body() dto: CreateProjectDocumentDto,
  ) {
    return this.projectService.addDocument(id, dto);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.projectService.getHistory(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
