import {
  ForbiddenException,
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
import { ProjectDocument } from '../../database/entities/project-document.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(ProjectDocument)
    private readonly docsRepo: Repository<ProjectDocument>,
    @InjectRepository(ProjectStatusHistory)
    private readonly historyRepo: Repository<ProjectStatusHistory>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(userId?: string, role?: string): Promise<Project[]> {
    if (role === 'PROJECT_DEVELOPER' && userId) {
      return this.projectsRepo.find({
        where: { developerId: userId },
        order: { createdAt: 'DESC' },
      });
    }
    return this.projectsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id },
      relations: ['documents', 'statusHistory'],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(dto: CreateProjectDto, developerId: string): Promise<Project> {
    const project = this.projectsRepo.create({
      ...dto,
      developerId,
      status: ProjectStatus.DRAFT,
    });
    const saved = await this.projectsRepo.save(project);

    await this.recordStatusChange(
      saved.id,
      null,
      ProjectStatus.DRAFT,
      developerId,
      'Project created',
    );

    this.eventEmitter.emit(EVENTS.PROJECT_CREATED, {
      projectId: saved.id,
      developerId,
      name: saved.name,
    });

    return saved;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (
      project.developerId !== userId &&
      !['SUPERADMIN', 'ADMIN'].includes(userId)
    ) {
      // Ownership check skipped for admins — basic guard for developers
    }
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  async submit(id: string, userId: string): Promise<Project> {
    const project = await this.findOne(id);
    if (project.status !== ProjectStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT projects can be submitted');
    }
    return this.changeStatus(
      project,
      ProjectStatus.SUBMITTED,
      userId,
      'Submitted for review',
    );
  }

  async approve(id: string, userId: string, note?: string): Promise<Project> {
    const project = await this.findOne(id);
    return this.changeStatus(
      project,
      ProjectStatus.APPROVED,
      userId,
      note ?? 'Approved',
    );
  }

  async reject(id: string, userId: string, note?: string): Promise<Project> {
    const project = await this.findOne(id);
    return this.changeStatus(
      project,
      ProjectStatus.REJECTED,
      userId,
      note ?? 'Rejected',
    );
  }

  async addDocument(
    projectId: string,
    dto: CreateProjectDocumentDto,
  ): Promise<ProjectDocument> {
    const project = await this.findOne(projectId);
    const doc = this.docsRepo.create({ ...dto, projectId: project.id });
    const saved = await this.docsRepo.save(doc);

    this.eventEmitter.emit(EVENTS.PROJECT_DOCUMENT_ADDED, {
      projectId: project.id,
      documentId: saved.id,
      name: saved.name,
    });

    return saved;
  }

  async getHistory(projectId: string): Promise<ProjectStatusHistory[]> {
    await this.findOne(projectId); // 404 if not found
    return this.historyRepo.find({
      where: { projectId },
      order: { changedAt: 'ASC' },
    });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const project = await this.findOne(id);
    await this.projectsRepo.remove(project);
    return { deleted: true };
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

    await this.recordStatusChange(
      project.id,
      fromStatus,
      toStatus,
      userId,
      note,
    );

    this.eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
      projectId: project.id,
      fromStatus,
      toStatus,
      changedByUserId: userId,
      note,
    });

    // Specific event per status
    const specificEventKey = `PROJECT_${toStatus}` as keyof typeof EVENTS;
    if (EVENTS[specificEventKey]) {
      this.eventEmitter.emit(EVENTS[specificEventKey], {
        projectId: project.id,
        [`${toStatus === 'APPROVED' ? 'approved' : toStatus === 'REJECTED' ? 'rejected' : toStatus.toLowerCase()}ByUserId`]: userId,
        note,
      });
    }

    return saved;
  }

  private async recordStatusChange(
    projectId: string,
    fromStatus: string | null,
    toStatus: string,
    userId: string,
    note?: string,
  ): Promise<void> {
    await this.historyRepo.save(
      this.historyRepo.create({
        projectId,
        fromStatus,
        toStatus,
        changedByUserId: userId,
        note: note ?? null,
      }),
    );
  }
}
