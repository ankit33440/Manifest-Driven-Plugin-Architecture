import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EVENTS } from '../../core/events/carbon.events';
import {
  Project,
  ProjectStatus,
} from '../../database/entities/project.entity';
import { CreditBatch } from '../../database/entities/credit-batch.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { CertifyProjectDto } from './dto/certify-project.dto';

export interface CertifierStats {
  pendingQueue: number;
  certifiedTotal: number;
  totalVolumeIssued: number;
  avgCreditsPerProject: number;
}

@Injectable()
export class CertifierService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(CreditBatch)
    private readonly batchesRepo: Repository<CreditBatch>,
    @InjectRepository(ProjectStatusHistory)
    private readonly historyRepo: Repository<ProjectStatusHistory>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getQueue(): Promise<Project[]> {
    return this.projectsRepo.find({
      where: { status: ProjectStatus.APPROVED },
      order: { updatedAt: 'ASC' },
    });
  }

  async certifyProject(
    projectId: string,
    certifierId: string,
    dto: CertifyProjectDto,
  ): Promise<{ project: Project; batch: CreditBatch }> {
    const project = await this.findProject(projectId);
    if (project.status !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED projects can be certified');
    }

    project.assignedCertifierId = certifierId;
    project.status = ProjectStatus.CERTIFIED;
    const savedProject = await this.projectsRepo.save(project);

    await this.historyRepo.save(
      this.historyRepo.create({
        projectId,
        fromStatus: ProjectStatus.APPROVED,
        toStatus: ProjectStatus.CERTIFIED,
        changedByUserId: certifierId,
        note: dto.note,
      }),
    );

    const batch = await this.batchesRepo.save(
      this.batchesRepo.create({
        projectId,
        certifierId,
        creditVolume: dto.creditVolume,
        serialNumberStart: dto.serialNumberStart,
        serialNumberEnd: dto.serialNumberEnd,
        certificationNote: dto.note,
      }),
    );

    this.eventEmitter.emit(EVENTS.PROJECT_CERTIFIED, {
      projectId,
      certifiedByUserId: certifierId,
      note: dto.note,
    });

    this.eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
      projectId,
      fromStatus: ProjectStatus.APPROVED,
      toStatus: ProjectStatus.CERTIFIED,
      changedByUserId: certifierId,
      note: dto.note,
    });

    return { project: savedProject, batch };
  }

  async rejectProject(
    projectId: string,
    certifierId: string,
    note: string,
  ): Promise<Project> {
    const project = await this.findProject(projectId);
    if (project.status !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED projects can be returned');
    }

    // Return to APPROVED (essentially a no-op status-wise — just log it)
    await this.historyRepo.save(
      this.historyRepo.create({
        projectId,
        fromStatus: ProjectStatus.APPROVED,
        toStatus: ProjectStatus.APPROVED,
        changedByUserId: certifierId,
        note: `Certification returned: ${note}`,
      }),
    );

    this.eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
      projectId,
      fromStatus: ProjectStatus.APPROVED,
      toStatus: ProjectStatus.APPROVED,
      changedByUserId: certifierId,
      note: `Certification returned: ${note}`,
    });

    return project;
  }

  async getBatchesForProject(projectId: string): Promise<CreditBatch[]> {
    return this.batchesRepo.find({
      where: { projectId },
      order: { issuedAt: 'DESC' },
    });
  }

  async getDashboardStats(certifierId: string): Promise<CertifierStats> {
    const pendingQueue = await this.projectsRepo.count({
      where: { status: ProjectStatus.APPROVED },
    });

    const myBatches = await this.batchesRepo.find({ where: { certifierId } });
    const certifiedTotal = myBatches.length;
    const totalVolumeIssued = myBatches.reduce(
      (sum, b) => sum + Number(b.creditVolume),
      0,
    );
    const avgCreditsPerProject = certifiedTotal > 0 ? totalVolumeIssued / certifiedTotal : 0;

    return { pendingQueue, certifiedTotal, totalVolumeIssued, avgCreditsPerProject };
  }

  private async findProject(projectId: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return project;
  }
}
