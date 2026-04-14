import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/entities/project.entity';
import { ProjectReview } from '../../database/entities/project-review.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { VerifierController } from './verifier.controller';
import { VerifierService } from './verifier.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectReview, ProjectStatusHistory])],
  controllers: [VerifierController],
  providers: [VerifierService],
})
export class VerifierModule {}
