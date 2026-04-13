import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns permissions grouped by module for the RBAC management UI. */
  async findAllGrouped() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    return permissions.reduce<Record<string, typeof permissions>>((groups, permission) => {
      groups[permission.module] = groups[permission.module] ?? [];
      groups[permission.module].push(permission);
      return groups;
    }, {});
  }
}
