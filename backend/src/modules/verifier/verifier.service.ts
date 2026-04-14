import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { EVENTS } from '../../core/events/carbon.events';
import {
  Project,
  ProjectStatus,
} from '../../database/entities/project.entity';
import {
  ProjectReview,
  ReviewOutcome,
} from '../../database/entities/project-review.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { ReviewDecisionDto } from './dto/review-decision.dto';

export interface VerifierStats {
  queueTotal: number;
  claimedByMe: number;
  approvedTotal: number;
  rejectedTotal: number;
}

@Injectable()
export class VerifierService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(ProjectReview)
    private readonly reviewsRepo: Repository<ProjectReview>,
    @InjectRepository(ProjectStatusHistory)
    private readonly historyRepo: Repository<ProjectStatusHistory>,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async getQueue(): Promise<Project[]> {
    return this.projectsRepo.find({
      where: { status: In([ProjectStatus.SUBMITTED, ProjectStatus.UNDER_REVIEW, ProjectStatus.INFO_REQUESTED]) },
      order: { createdAt: 'ASC' },
    });
  }

  async getClaimedProjects(verifierId: string): Promise<Project[]> {
    return this.projectsRepo.find({
      where: { assignedVerifierId: verifierId },
      order: { updatedAt: 'DESC' },
    });
  }

  async claimProject(projectId: string, verifierId: string): Promise<Project> {
    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(Project);
      const project = await repo.findOne({ where: { id: projectId } });
      if (!project) throw new NotFoundException(`Project ${projectId} not found`);
      if (project.status !== ProjectStatus.SUBMITTED && project.status !== ProjectStatus.INFO_REQUESTED) {
        throw new BadRequestException('Project must be SUBMITTED or INFO_REQUESTED to claim');
      }
      if (project.assignedVerifierId && project.assignedVerifierId !== verifierId) {
        throw new ForbiddenException('Project is already claimed by another verifier');
      }
      if (project.assignedVerifierId === verifierId) {
        return project; // idempotent re-claim
      }

      project.assignedVerifierId = verifierId;
      project.status = ProjectStatus.UNDER_REVIEW;
      const saved = await repo.save(project);

      await em.getRepository(ProjectStatusHistory).save(
        em.getRepository(ProjectStatusHistory).create({
          projectId,
          fromStatus: ProjectStatus.SUBMITTED,
          toStatus: ProjectStatus.UNDER_REVIEW,
          changedByUserId: verifierId,
          note: 'Claimed by verifier',
        }),
      );

      // Create a new review record for this cycle
      await em.getRepository(ProjectReview).save(
        em.getRepository(ProjectReview).create({
          projectId,
          verifierId,
          methodologyCheck: false,
          boundaryCheck: false,
          additionalityCheck: false,
          permanenceCheck: false,
          outcome: null,
        }),
      );

      this.eventEmitter.emit(EVENTS.PROJECT_CLAIMED, {
        projectId,
        claimedByVerifierId: verifierId,
      });

      this.eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
        projectId,
        fromStatus: ProjectStatus.SUBMITTED,
        toStatus: ProjectStatus.UNDER_REVIEW,
        changedByUserId: verifierId,
        note: 'Claimed by verifier',
      });

      return saved;
    });
  }

  async updateChecklist(
    projectId: string,
    verifierId: string,
    dto: UpdateChecklistDto,
  ): Promise<ProjectReview> {
    const review = await this.getActiveReview(projectId, verifierId);
    Object.assign(review, dto);
    return this.reviewsRepo.save(review);
  }

  async requestInfo(
    projectId: string,
    verifierId: string,
    dto: ReviewDecisionDto,
  ): Promise<Project> {
    const project = await this.findProject(projectId);
    await this.assertVerifierOwns(project, verifierId);
    if (project.status !== ProjectStatus.UNDER_REVIEW) {
      throw new BadRequestException('Project must be UNDER_REVIEW to request information');
    }

    const review = await this.getActiveReview(projectId, verifierId);
    review.outcome = ReviewOutcome.INFO_REQUESTED;
    review.reviewNote = dto.note;
    await this.reviewsRepo.save(review);

    return this.changeStatus(project, ProjectStatus.INFO_REQUESTED, verifierId, dto.note);
  }

  async approveProject(
    projectId: string,
    verifierId: string,
    dto: ReviewDecisionDto,
  ): Promise<Project> {
    const project = await this.findProject(projectId);
    await this.assertVerifierOwns(project, verifierId);
    if (project.status !== ProjectStatus.UNDER_REVIEW) {
      throw new BadRequestException('Project must be UNDER_REVIEW to approve');
    }

    const review = await this.getActiveReview(projectId, verifierId);
    review.outcome = ReviewOutcome.APPROVED;
    review.reviewNote = dto.note;
    await this.reviewsRepo.save(review);

    this.eventEmitter.emit(EVENTS.PROJECT_APPROVED, {
      projectId,
      approvedByUserId: verifierId,
      note: dto.note,
    });

    return this.changeStatus(project, ProjectStatus.APPROVED, verifierId, dto.note);
  }

  async rejectProject(
    projectId: string,
    verifierId: string,
    dto: ReviewDecisionDto,
  ): Promise<Project> {
    const project = await this.findProject(projectId);
    await this.assertVerifierOwns(project, verifierId);
    if (project.status !== ProjectStatus.UNDER_REVIEW) {
      throw new BadRequestException('Project must be UNDER_REVIEW to reject');
    }

    const review = await this.getActiveReview(projectId, verifierId);
    review.outcome = ReviewOutcome.REJECTED;
    review.reviewNote = dto.note;
    await this.reviewsRepo.save(review);

    this.eventEmitter.emit(EVENTS.PROJECT_REJECTED, {
      projectId,
      rejectedByUserId: verifierId,
      note: dto.note,
    });

    return this.changeStatus(project, ProjectStatus.REJECTED, verifierId, dto.note);
  }

  async getReview(projectId: string): Promise<ProjectReview | null> {
    return this.reviewsRepo.findOne({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDashboardStats(verifierId: string): Promise<VerifierStats> {
    const queueTotal = await this.projectsRepo.count({
      where: { status: In([ProjectStatus.SUBMITTED, ProjectStatus.UNDER_REVIEW, ProjectStatus.INFO_REQUESTED]) },
    });
    const claimedByMe = await this.projectsRepo.count({
      where: { assignedVerifierId: verifierId },
    });
    const approvedTotal = await this.reviewsRepo.count({
      where: { verifierId, outcome: ReviewOutcome.APPROVED },
    });
    const rejectedTotal = await this.reviewsRepo.count({
      where: { verifierId, outcome: ReviewOutcome.REJECTED },
    });
    return { queueTotal, claimedByMe, approvedTotal, rejectedTotal };
  }

  private async findProject(projectId: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return project;
  }

  private async assertVerifierOwns(project: Project, verifierId: string): Promise<void> {
    if (project.assignedVerifierId !== verifierId) {
      throw new ForbiddenException('You are not the assigned verifier for this project');
    }
  }

  private async getActiveReview(projectId: string, verifierId: string): Promise<ProjectReview> {
    const review = await this.reviewsRepo.findOne({
      where: { projectId, verifierId },
      order: { createdAt: 'DESC' },
    });
    if (!review) throw new NotFoundException('No active review found for this project');
    return review;
  }

  private async changeStatus(
    project: Project,
    toStatus: ProjectStatus,
    userId: string,
    note?: string,
  ): Promise<Project> {
    const fromStatus = project.status;
    project.status = toStatus;
    const saved = await this.projectsRepo.save(project);

    await this.historyRepo.save(
      this.historyRepo.create({
        projectId: project.id,
        fromStatus,
        toStatus,
        changedByUserId: userId,
        note: note ?? null,
      }),
    );

    this.eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
      projectId: project.id,
      fromStatus,
      toStatus,
      changedByUserId: userId,
      note,
    });

    return saved;
  }
}
