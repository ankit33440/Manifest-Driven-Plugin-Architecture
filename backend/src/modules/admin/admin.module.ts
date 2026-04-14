import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { CreditBatch } from '../../database/entities/credit-batch.entity';
import { Project } from '../../database/entities/project.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { User } from '../../database/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project, ProjectStatusHistory, AuditLog, CreditBatch]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
