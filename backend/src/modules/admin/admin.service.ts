import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { EVENTS } from '../../core/events/carbon.events';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { CreditBatch } from '../../database/entities/credit-batch.entity';
import {
  Project,
  ProjectStatus,
} from '../../database/entities/project.entity';
import { ProjectStatusHistory } from '../../database/entities/project-status-history.entity';
import {
  User,
  UserRole,
  UserStatus,
} from '../../database/entities/user.entity';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { ForceStatusDto } from './dto/force-status.dto';
import { AuditFilterDto } from './dto/audit-filter.dto';

export interface PlatformStats {
  usersByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  totalCreditVolume: number;
  pendingUsers: User[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(ProjectStatusHistory)
    private readonly historyRepo: Repository<ProjectStatusHistory>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(CreditBatch)
    private readonly batchesRepo: Repository<CreditBatch>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getPlatformStats(): Promise<PlatformStats> {
    const users = await this.usersRepo.find();
    const projects = await this.projectsRepo.find();
    const batches = await this.batchesRepo.find();

    const usersByStatus: Record<string, number> = {};
    for (const u of users) {
      usersByStatus[u.status] = (usersByStatus[u.status] ?? 0) + 1;
    }

    const projectsByStatus: Record<string, number> = {};
    for (const p of projects) {
      projectsByStatus[p.status] = (projectsByStatus[p.status] ?? 0) + 1;
    }

    const totalCreditVolume = batches.reduce(
      (sum, b) => sum + Number(b.creditVolume),
      0,
    );

    const pendingUsers = users.filter(
      (u) => u.status === UserStatus.PENDING_APPROVAL,
    );

    return { usersByStatus, projectsByStatus, totalCreditVolume, pendingUsers };
  }

  async listUsers(role?: string, status?: string): Promise<User[]> {
    const where: FindOptionsWhere<User> = {};
    if (role) where.role = role as UserRole;
    if (status) where.status = status as UserStatus;
    return this.usersRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async approveUser(userId: string, adminId: string): Promise<User> {
    const user = await this.findUser(userId);
    user.status = UserStatus.ACTIVE;
    const saved = await this.usersRepo.save(user);
    this.eventEmitter.emit(EVENTS.USER_APPROVED, { userId, approvedByUserId: adminId });
    this.eventEmitter.emit(EVENTS.USER_SUSPENDED, {
      userId,
      changedByUserId: adminId,
      newStatus: UserStatus.ACTIVE,
    });
    return saved;
  }

  async rejectUser(userId: string, adminId: string, note?: string): Promise<User> {
    const user = await this.findUser(userId);
    user.status = UserStatus.SUSPENDED;
    const saved = await this.usersRepo.save(user);
    this.eventEmitter.emit(EVENTS.USER_REJECTED, {
      userId,
      rejectedByUserId: adminId,
      note,
    });
    return saved;
  }

  async suspendUser(userId: string, adminId: string): Promise<User> {
    const user = await this.findUser(userId);
    user.status = UserStatus.SUSPENDED;
    const saved = await this.usersRepo.save(user);
    this.eventEmitter.emit(EVENTS.USER_SUSPENDED, {
      userId,
      changedByUserId: adminId,
      newStatus: UserStatus.SUSPENDED,
    });
    return saved;
  }

  async reactivateUser(userId: string, adminId: string): Promise<User> {
    const user = await this.findUser(userId);
    user.status = UserStatus.ACTIVE;
    const saved = await this.usersRepo.save(user);
    this.eventEmitter.emit(EVENTS.USER_REACTIVATED, {
      userId,
      changedByUserId: adminId,
      newStatus: UserStatus.ACTIVE,
    });
    return saved;
  }

  async changeUserRole(
    userId: string,
    adminId: string,
    dto: ChangeUserRoleDto,
  ): Promise<User> {
    const user = await this.findUser(userId);
    user.role = dto.role;
    return this.usersRepo.save(user);
  }

  async getAuditLogs(
    filter: AuditFilterDto,
  ): Promise<{ data: AuditLog[]; total: number; page: number; totalPages: number }> {
    const page = parseInt(filter.page ?? '1', 10);
    const limit = parseInt(filter.limit ?? '20', 10);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AuditLog> = {};
    if (filter.entity) where.entity = filter.entity;
    if (filter.performedBy) where.performedBy = filter.performedBy;
    if (filter.from && filter.to) {
      where.createdAt = Between(new Date(filter.from), new Date(filter.to));
    }

    const [data, total] = await this.auditRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async forceProjectStatus(
    projectId: string,
    adminId: string,
    dto: ForceStatusDto,
  ): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const fromStatus = project.status;
    project.status = dto.status;
    const saved = await this.projectsRepo.save(project);

    await this.historyRepo.save(
      this.historyRepo.create({
        projectId,
        fromStatus,
        toStatus: dto.status,
        changedByUserId: adminId,
        note: dto.note ?? `Force status change by admin`,
      }),
    );

    this.eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
      projectId,
      fromStatus,
      toStatus: dto.status,
      changedByUserId: adminId,
      note: dto.note,
    });

    return saved;
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return user;
  }
}
