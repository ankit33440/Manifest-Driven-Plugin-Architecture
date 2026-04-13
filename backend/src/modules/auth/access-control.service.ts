import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface UserAccessRecord {
  roles: string[];
  permissions: string[];
  expiresAt: number;
}

@Injectable()
export class AccessControlService {
  private readonly cache = new Map<string, UserAccessRecord>();
  private readonly ttlMs = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  /** Returns cached or freshly loaded roles and permissions for a user. */
  async getUserAccess(userId: string) {
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return { roles: cached.roles, permissions: cached.permissions };
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const roles = userRoles.map(({ role }) => role.name);
    const permissions = Array.from(
      new Set(
        userRoles.flatMap(({ role }) =>
          role.rolePermissions.map(({ permission }) => permission.key),
        ),
      ),
    );

    this.cache.set(userId, {
      roles,
      permissions,
      expiresAt: Date.now() + this.ttlMs,
    });

    return { roles, permissions };
  }

  /** Clears a single user's cached access snapshot. */
  invalidateUserAccess(userId: string) {
    this.cache.delete(userId);
  }

  /** Clears every cached access snapshot after role-permission changes. */
  invalidateAll() {
    this.cache.clear();
  }
}
