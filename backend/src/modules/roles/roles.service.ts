import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AccessControlService } from '../auth/access-control.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService,
  ) {}

  /** Returns every role with its attached permissions. */
  async findAll() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  /** Creates a custom role entry. */
  async create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: dto.name.toUpperCase().replace(/\s+/g, '_'),
        description: dto.description,
        isSystem: false,
      },
    });
  }

  /** Updates a role's label and description. */
  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.toUpperCase().replace(/\s+/g, '_') : undefined,
        description: dto.description,
      },
    });
  }

  /** Deletes a custom role while preventing system role removal. */
  async remove(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted.');
    }

    await this.prisma.role.delete({ where: { id } });
    this.accessControlService.invalidateAll();
    return { deleted: true };
  }

  /** Replaces the permissions attached to a role in one operation. */
  async replacePermissions(id: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
      skipDuplicates: true,
    });

    this.accessControlService.invalidateAll();
    return this.findAll();
  }
}
