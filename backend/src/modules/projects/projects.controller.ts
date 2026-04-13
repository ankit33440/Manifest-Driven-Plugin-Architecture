import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsDto } from './dto/list-projects.dto';
import { ProjectActionDto } from './dto/project-action.dto';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions('project:create')
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.create(dto, user.sub);
  }

  @Get()
  findAll(@Query() query: ListProjectsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @RequirePermissions('project:update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.update(id, dto, user);
  }

  @Patch(':id/submit')
  @RequirePermissions('project:submit')
  submit(
    @Param('id') id: string,
    @Body() dto: ProjectActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.submit(id, user.sub, user, dto.note);
  }

  @Patch(':id/approve')
  @RequirePermissions('project:approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ProjectActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.approve(id, user.sub, dto.note);
  }

  @Patch(':id/reject')
  @RequirePermissions('project:approve')
  reject(
    @Param('id') id: string,
    @Body() dto: ProjectActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.reject(id, user.sub, dto.note);
  }

  @Patch(':id/verify')
  @RequirePermissions('project:verify')
  verify(
    @Param('id') id: string,
    @Body() dto: ProjectActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.verify(id, user.sub, dto.note);
  }

  @Patch(':id/certify')
  @RequirePermissions('project:certify')
  certify(
    @Param('id') id: string,
    @Body() dto: ProjectActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.certify(id, user.sub, dto.note);
  }

  @Post(':id/documents')
  @RequirePermissions('project:document_upload')
  addDocument(
    @Param('id') id: string,
    @Body() dto: CreateProjectDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.addDocument(id, dto, user);
  }

  @Get(':id/history')
  findHistory(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.getHistory(id, user);
  }
}
