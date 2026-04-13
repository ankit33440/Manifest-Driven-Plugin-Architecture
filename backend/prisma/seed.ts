import { PrismaClient, UserStatus, InvitationStatus, ProjectStatus, ProjectStandard, ProjectType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SYSTEM_ROLES = [
  { name: 'SUPERADMIN', description: 'Full platform access', isSystem: true },
  { name: 'ADMIN', description: 'Platform operations administrator', isSystem: true },
  { name: 'PROJECT_DEVELOPER', description: 'Project registration and management', isSystem: true },
  { name: 'VERIFIER', description: 'Project verification access', isSystem: true },
  { name: 'CERTIFIER', description: 'Project certification access', isSystem: true },
  { name: 'BUYER', description: 'Marketplace buyer access', isSystem: true },
] as const;

const PERMISSIONS = [
  ['project:create', 'Create projects', 'PROJECT'],
  ['project:update', 'Update owned projects', 'PROJECT'],
  ['project:submit', 'Submit projects', 'PROJECT'],
  ['project:view', 'View all projects', 'PROJECT'],
  ['project:view_own', 'View own projects', 'PROJECT'],
  ['project:approve', 'Approve or reject submitted projects', 'PROJECT'],
  ['project:verify', 'Verify approved projects', 'PROJECT'],
  ['project:certify', 'Certify verified projects', 'PROJECT'],
  ['project:document_upload', 'Upload project documents', 'PROJECT'],
  ['user:view', 'View users', 'USER'],
  ['user:update_status', 'Change user status', 'USER'],
  ['user:approve', 'Approve or reject users', 'USER'],
  ['user:assign_roles', 'Assign roles to users', 'USER'],
  ['invitation:create', 'Create invitations', 'INVITATION'],
  ['invitation:view', 'View invitations', 'INVITATION'],
  ['invitation:revoke', 'Revoke invitations', 'INVITATION'],
  ['role:view', 'View roles', 'ROLE'],
  ['role:create', 'Create custom roles', 'ROLE'],
  ['role:update', 'Update roles', 'ROLE'],
  ['role:delete', 'Delete custom roles', 'ROLE'],
  ['role:assign_permissions', 'Assign permissions to roles', 'ROLE'],
  ['permission:view', 'View permissions', 'PERMISSION'],
  ['dashboard:view', 'View admin dashboard', 'DASHBOARD'],
  ['credit:view', 'View credits', 'CREDIT'],
  ['credit:purchase', 'Purchase credits', 'CREDIT'],
] as const;

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  SUPERADMIN: PERMISSIONS.map(([key]) => key),
  ADMIN: PERMISSIONS
    .map(([key]) => key)
    .filter((key) => !key.startsWith('role:') && !key.startsWith('permission:')),
  PROJECT_DEVELOPER: ['project:create', 'project:update', 'project:submit', 'project:view_own', 'project:document_upload'],
  VERIFIER: ['project:view', 'project:verify'],
  CERTIFIER: ['project:view', 'project:certify', 'credit:view'],
  BUYER: ['credit:view', 'credit:purchase'],
};

async function main() {
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }

  for (const [key, description, module] of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: { description, module },
      create: { key, description, module },
    });
  }

  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  for (const role of roles) {
    const permissionKeys = ROLE_PERMISSION_MAP[role.name] ?? [];
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    if (permissionKeys.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions
          .filter((permission) => permissionKeys.includes(permission.key))
          .map((permission) => ({ roleId: role.id, permissionId: permission.id })),
        skipDuplicates: true,
      });
    }
  }

  const superadminPassword = process.env.SUPERADMIN_PASSWORD ?? 'ChangeMe123!';
  const superadminEmail = process.env.SUPERADMIN_EMAIL ?? 'superadmin@naturesregistry.com';
  const superadminRole = roles.find((role) => role.name === 'SUPERADMIN');

  if (!superadminRole) {
    throw new Error('SUPERADMIN role not found during seed.');
  }

  const passwordHash = await bcrypt.hash(superadminPassword, 10);
  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      passwordHash,
      firstName: process.env.SUPERADMIN_FIRST_NAME ?? 'System',
      lastName: process.env.SUPERADMIN_LAST_NAME ?? 'Administrator',
      status: UserStatus.ACTIVE,
    },
    create: {
      email: superadminEmail,
      passwordHash,
      firstName: process.env.SUPERADMIN_FIRST_NAME ?? 'System',
      lastName: process.env.SUPERADMIN_LAST_NAME ?? 'Administrator',
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superadmin.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: {
      userId: superadmin.id,
      roleId: superadminRole.id,
    },
  });

  console.log(`Seeded roles, permissions, and superadmin ${superadmin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
