import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/entities/project.entity';
import { CreditBatch } from '../../database/entities/credit-batch.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { CertifierController } from './certifier.controller';
import { CertifierService } from './certifier.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, CreditBatch, ProjectStatusHistory])],
  controllers: [CertifierController],
  providers: [CertifierService],
})
export class CertifierModule {}
