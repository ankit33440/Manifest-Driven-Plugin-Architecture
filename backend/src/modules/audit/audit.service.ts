import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProjectClaimedPayload,
  ProjectCertifiedPayload,
  ProjectCreatedPayload,
  ProjectDocumentAddedPayload,
  ProjectStatusChangedPayload,
  UserApprovedPayload,
  UserRejectedPayload,
  UserStatusChangedPayload,
  UserRegisteredPayload,
} from '../../core/events/carbon.event-payloads';
import { EVENTS } from '../../core/events/carbon.events';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  @OnEvent(EVENTS.PROJECT_CREATED, { async: true })
  async onProjectCreated(payload: ProjectCreatedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'PROJECT',
        entityId: payload.projectId,
        action: 'CREATED',
        performedBy: payload.developerId,
        metadata: { name: payload.name },
      }),
    );
  }

  @OnEvent(EVENTS.PROJECT_STATUS_CHANGED, { async: true })
  async onProjectStatusChanged(payload: ProjectStatusChangedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'PROJECT',
        entityId: payload.projectId,
        action: `STATUS_CHANGED:${payload.fromStatus}→${payload.toStatus}`,
        performedBy: payload.changedByUserId,
        metadata: { note: payload.note ?? null },
      }),
    );
  }

  @OnEvent(EVENTS.PROJECT_DOCUMENT_ADDED, { async: true })
  async onDocumentAdded(payload: ProjectDocumentAddedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'PROJECT_DOCUMENT',
        entityId: payload.documentId,
        action: 'DOCUMENT_ADDED',
        performedBy: null,
        metadata: { projectId: payload.projectId, name: payload.name },
      }),
    );
  }

  @OnEvent(EVENTS.USER_REGISTERED, { async: true })
  async onUserRegistered(payload: UserRegisteredPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'USER',
        entityId: payload.userId,
        action: 'REGISTERED',
        performedBy: payload.userId,
        metadata: { email: payload.email, role: payload.role },
      }),
    );
  }

  @OnEvent(EVENTS.PROJECT_CLAIMED, { async: true })
  async onProjectClaimed(payload: ProjectClaimedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'PROJECT',
        entityId: payload.projectId,
        action: 'CLAIMED',
        performedBy: payload.claimedByVerifierId,
        metadata: {},
      }),
    );
  }

  @OnEvent(EVENTS.PROJECT_CERTIFIED, { async: true })
  async onProjectCertified(payload: ProjectCertifiedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'PROJECT',
        entityId: payload.projectId,
        action: 'CERTIFIED',
        performedBy: payload.certifiedByUserId,
        metadata: { note: payload.note ?? null },
      }),
    );
  }

  @OnEvent(EVENTS.USER_APPROVED, { async: true })
  async onUserApproved(payload: UserApprovedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'USER',
        entityId: payload.userId,
        action: 'APPROVED',
        performedBy: payload.approvedByUserId,
        metadata: {},
      }),
    );
  }

  @OnEvent(EVENTS.USER_REJECTED, { async: true })
  async onUserRejected(payload: UserRejectedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'USER',
        entityId: payload.userId,
        action: 'REJECTED',
        performedBy: payload.rejectedByUserId,
        metadata: { note: payload.note ?? null },
      }),
    );
  }

  @OnEvent(EVENTS.USER_SUSPENDED, { async: true })
  async onUserSuspended(payload: UserStatusChangedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'USER',
        entityId: payload.userId,
        action: 'SUSPENDED',
        performedBy: payload.changedByUserId,
        metadata: { note: payload.note ?? null },
      }),
    );
  }

  @OnEvent(EVENTS.USER_REACTIVATED, { async: true })
  async onUserReactivated(payload: UserStatusChangedPayload) {
    await this.repo.save(
      this.repo.create({
        entity: 'USER',
        entityId: payload.userId,
        action: 'REACTIVATED',
        performedBy: payload.changedByUserId,
        metadata: { note: payload.note ?? null },
      }),
    );
  }
}
