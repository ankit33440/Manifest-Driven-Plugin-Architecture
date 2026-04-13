import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListUsersDto } from './dto/list-users.dto';
import { AccessControlService } from '../auth/access-control.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
    private readonly auditService: AuditService,
  ) {}

  /** Returns a filterable list of users with their assigned roles. */
  async findAll(query: ListUsersDto) {
    return this.prisma.user.findMany({
      where: {
        status: query.status as never | undefined,
        userRoles: query.role
          ? {
              some: {
                role: {
                  name: query.role,
                },
              },
            }
          : undefined,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Returns a single user record for the admin detail view. */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /** Replaces the full set of roles assigned to a user. */
  async assignRoles(userId: string, roleIds: string[]) {
    await this.ensureUserExists(userId);
    await this.prisma.userRole.deleteMany({ where: { userId } });
    await this.prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
      skipDuplicates: true,
    });
    this.accessControlService.invalidateUserAccess(userId);
    return this.findOne(userId);
  }

  /** Updates a user's status such as activating or suspending the account. */
  async updateStatus(userId: string, dto: UpdateUserStatusDto, changedByUserId: string) {
    await this.ensureUserExists(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status,
        statusNote: dto.note,
      },
    });

    await this.auditService.createLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'STATUS_UPDATED',
      userId: changedByUserId,
      metadata: {
        status: dto.status,
        note: dto.note,
      },
    });

    this.accessControlService.invalidateUserAccess(userId);
    return user;
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
  }
}
