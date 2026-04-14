import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/entities/project.entity';
import { ProjectDocument } from '../../database/entities/project-document.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectDocument, ProjectStatusHistory]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService, TypeOrmModule],
})
export class ProjectModule {}
