import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvitationStatus, UserStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AccessControlService } from '../auth/access-control.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
    private readonly accessControlService: AccessControlService,
  ) {}

  /** Returns dashboard statistics plus the latest pending approvals and invitations. */
  async getDashboardSummary() {
    const [totalUsers, pendingApprovals, activeProjects, certifiedProjects, recentInvitations] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: UserStatus.PENDING_APPROVAL } }),
        this.prisma.project.count({ where: { status: 'ACTIVE' } }),
        this.prisma.project.findMany({
          where: { status: { in: ['CERTIFIED', 'ACTIVE'] } },
          select: { estimatedCredits: true },
        }),
        this.prisma.invitation.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { role: true },
        }),
      ]);

    const totalCreditsIssued = certifiedProjects.reduce(
      (sum, project) => sum + Number(project.estimatedCredits ?? 0),
      0,
    );

    return {
      stats: {
        totalUsers,
        pendingApprovals,
        activeProjects,
        totalCreditsIssued,
      },
      pendingApprovals: await this.getPendingApprovals(),
      recentInvitations,
    };
  }

  /** Lists users waiting for approval. */
  async getPendingApprovals() {
    return this.prisma.user.findMany({
      where: { status: UserStatus.PENDING_APPROVAL },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Approves a pending user and sends a welcome email. */
  async approveUser(userId: string, approvedByUserId: string, note?: string) {
    const user = await this.ensureUserExists(userId);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        statusNote: note,
      },
    });

    await this.auditService.createLog({
      entityType: 'USER',
      entityId: userId,
      action: 'APPROVED',
      userId: approvedByUserId,
      metadata: { note },
    });

    await this.emailService.sendEmail(
      user.email,
      'Welcome to Nature Registry',
      'Your account has been approved and activated.',
    );

    this.accessControlService.invalidateUserAccess(userId);
    return updatedUser;
  }

  /** Rejects a pending user and sends the optional rejection reason. */
  async rejectUser(userId: string, rejectedByUserId: string, note?: string) {
    const user = await this.ensureUserExists(userId);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.REJECTED,
        statusNote: note,
      },
    });

    await this.auditService.createLog({
      entityType: 'USER',
      entityId: userId,
      action: 'REJECTED',
      userId: rejectedByUserId,
      metadata: { note },
    });

    await this.emailService.sendEmail(
      user.email,
      'Nature Registry account update',
      `Your account request has been rejected.${note ? ` Reason: ${note}` : ''}`,
    );

    this.accessControlService.invalidateUserAccess(userId);
    return updatedUser;
  }

  /** Creates and emails a role-bound invitation. */
  async inviteUser(dto: InviteUserDto, invitedByUserId: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName.toUpperCase() },
    });

    if (!role) {
      throw new BadRequestException('Requested role does not exist.');
    }

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email.toLowerCase(),
        roleId: role.id,
        token: randomUUID(),
        invitedByUserId,
        expiresAt: new Date(
          Date.now() +
            this.configService.get<number>('INVITATION_EXPIRY_HOURS', 72) *
              60 *
              60 *
              1000,
        ),
      },
      include: { role: true },
    });

    await this.emailService.sendEmail(
      invitation.email,
      'You have been invited to Nature Registry',
      `${this.configService.get<string>('FRONTEND_URL')}/register?token=${invitation.token}`,
    );

    await this.auditService.createLog({
      entityType: 'INVITATION',
      entityId: invitation.id,
      action: 'CREATED',
      userId: invitedByUserId,
      metadata: { email: invitation.email, roleName: invitation.role.name },
    });

    return invitation;
  }

  /** Lists invitations and expires any stale pending entries. */
  async getInvitations() {
    await this.prisma.invitation.updateMany({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: { lte: new Date() },
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    return this.prisma.invitation.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Revokes an invitation before it is accepted. */
  async revokeInvitation(id: string, revokedByUserId: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }

    const updatedInvitation = await this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });

    await this.auditService.createLog({
      entityType: 'INVITATION',
      entityId: id,
      action: 'REVOKED',
      userId: revokedByUserId,
    });

    return updatedInvitation;
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }
}
