import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsDto } from './dto/list-projects.dto';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateProjectDocumentDto } from './dto/create-project-document.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /** Creates a new project draft for the authenticated developer. */
  async create(dto: CreateProjectDto, developerId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...this.mapCreateData(dto, developerId),
      },
      include: this.projectInclude,
    });

    await this.createStatusHistory(project.id, null, ProjectStatus.DRAFT, developerId, 'Draft created');
    await this.auditService.createLog({
      entityType: 'PROJECT',
      entityId: project.id,
      action: 'CREATED',
      userId: developerId,
    });

    return project;
  }

  /** Returns projects filtered by status or type and scoped to the current user. */
  async findAll(query: ListProjectsDto, user: AuthenticatedUser) {
    const hasGlobalView =
      user.permissions?.includes('project:view') ||
      user.roles.includes('SUPERADMIN') ||
      user.roles.includes('ADMIN');

    return this.prisma.project.findMany({
      where: {
        status: query.status as ProjectStatus | undefined,
        type: query.type as never | undefined,
        developerId: hasGlobalView ? undefined : user.sub,
      },
      include: this.projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Returns a project detail view including documents and timeline history. */
  async findOne(id: string, user: AuthenticatedUser) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: this.projectInclude,
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    this.ensureCanView(project, user);
    return project;
  }

  /** Updates a project while preserving ownership and workflow constraints. */
  async update(id: string, dto: UpdateProjectDto, user: AuthenticatedUser) {
    const project = await this.findOne(id, user);
    this.ensureCanMutate(project, user);

    if (project.status !== ProjectStatus.DRAFT && !this.isAdmin(user)) {
      throw new BadRequestException('Only draft projects can be edited by developers.');
    }

    return this.prisma.project.update({
      where: { id },
      data: this.mapUpdateData(dto),
      include: this.projectInclude,
    });
  }

  /** Submits a project draft for admin review. */
  async submit(id: string, userId: string, user: AuthenticatedUser, note?: string) {
    const project = await this.findOne(id, user);
    this.ensureCanMutate(project, user);

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Only draft projects can be submitted.');
    }

    return this.transitionStatus(project.id, ProjectStatus.SUBMITTED, userId, note);
  }

  /** Approves a submitted project. */
  async approve(id: string, userId: string, note?: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (
      project.status !== ProjectStatus.SUBMITTED &&
      project.status !== ProjectStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Only submitted or under-review projects can be approved.');
    }

    return this.transitionStatus(id, ProjectStatus.APPROVED, userId, note);
  }

  /** Rejects a submitted project. */
  async reject(id: string, userId: string, note?: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (
      project.status !== ProjectStatus.SUBMITTED &&
      project.status !== ProjectStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Only submitted or under-review projects can be rejected.');
    }

    return this.transitionStatus(id, ProjectStatus.REJECTED, userId, note);
  }

  /** Marks an approved project as verified by a verifier. */
  async verify(id: string, userId: string, note?: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (project.status !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Only approved projects can be verified.');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.VERIFIED,
        verifierId: userId,
      },
      include: this.projectInclude,
    });

    await this.createStatusHistory(id, project.status, ProjectStatus.VERIFIED, userId, note);
    return updatedProject;
  }

  /** Marks a verified project as certified by a certifier. */
  async certify(id: string, userId: string, note?: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (project.status !== ProjectStatus.VERIFIED) {
      throw new BadRequestException('Only verified projects can be certified.');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.CERTIFIED,
        certifierId: userId,
      },
      include: this.projectInclude,
    });

    await this.createStatusHistory(id, project.status, ProjectStatus.CERTIFIED, userId, note);
    return updatedProject;
  }

  /** Stores metadata for a project document upload. */
  async addDocument(id: string, dto: CreateProjectDocumentDto, user: AuthenticatedUser) {
    const project = await this.findOne(id, user);
    this.ensureCanMutate(project, user);

    return this.prisma.projectDocument.create({
      data: {
        projectId: id,
        name: dto.name,
        url: dto.url,
        type: dto.type,
      },
    });
  }

  /** Returns ordered status history for the project timeline. */
  async getHistory(id: string, user: AuthenticatedUser) {
    await this.findOne(id, user);
    return this.prisma.projectStatusHistory.findMany({
      where: { projectId: id },
      include: {
        changedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { changedAt: 'asc' },
    });
  }

  private async transitionStatus(
    id: string,
    status: ProjectStatus,
    userId: string,
    note?: string,
  ) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: { status },
      include: this.projectInclude,
    });

    await this.createStatusHistory(id, project.status, status, userId, note);
    await this.auditService.createLog({
      entityType: 'PROJECT',
      entityId: id,
      action: `STATUS_${status}`,
      userId,
      metadata: { fromStatus: project.status, toStatus: status, note },
    });

    return updatedProject;
  }

  private async createStatusHistory(
    projectId: string,
    fromStatus: ProjectStatus | null,
    toStatus: ProjectStatus,
    changedByUserId: string,
    note?: string,
  ) {
    await this.prisma.projectStatusHistory.create({
      data: {
        projectId,
        fromStatus: fromStatus ?? undefined,
        toStatus,
        changedByUserId,
        note,
      },
    });
  }

  private ensureCanView(project: { developerId: string }, user: AuthenticatedUser) {
    if (this.isAdmin(user)) {
      return;
    }

    if (user.roles.includes('PROJECT_DEVELOPER') && project.developerId === user.sub) {
      return;
    }

    if (user.roles.includes('VERIFIER') || user.roles.includes('CERTIFIER')) {
      return;
    }

    throw new ForbiddenException('You do not have access to this project.');
  }

  private ensureCanMutate(project: { developerId: string }, user: AuthenticatedUser) {
    if (this.isAdmin(user) || project.developerId === user.sub) {
      return;
    }

    throw new ForbiddenException('Only the project owner or an admin can modify this project.');
  }

  private isAdmin(user: AuthenticatedUser) {
    return user.roles.includes('SUPERADMIN') || user.roles.includes('ADMIN');
  }

  private mapCreateData(
    dto: CreateProjectDto,
    developerId: string,
  ): Prisma.ProjectUncheckedCreateInput {
    return {
      developerId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      standard: dto.standard,
      country: dto.country ?? '',
      region: dto.region ?? '',
      latitude: dto.latitude,
      longitude: dto.longitude,
      areaHectares: dto.areaHectares,
      estimatedCredits: dto.estimatedCredits,
      vintageStartYear: dto.vintageStartYear,
      vintageEndYear: dto.vintageEndYear,
    };
  }

  private mapUpdateData(dto: UpdateProjectDto): Prisma.ProjectUncheckedUpdateInput {
    return {
      name: dto.name,
      description: dto.description,
      type: dto.type,
      standard: dto.standard,
      country: dto.country,
      region: dto.region,
      latitude: dto.latitude,
      longitude: dto.longitude,
      areaHectares: dto.areaHectares,
      estimatedCredits: dto.estimatedCredits,
      vintageStartYear: dto.vintageStartYear,
      vintageEndYear: dto.vintageEndYear,
    };
  }

  private readonly projectInclude = {
    developer: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    verifier: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    certifier: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    documents: true,
    statusHistory: {
      include: {
        changedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { changedAt: 'asc' as const },
    },
  };
}
