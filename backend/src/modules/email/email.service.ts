import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ProjectApprovedPayload,
  ProjectRejectedPayload,
  UserApprovedPayload,
  UserRejectedPayload,
  UserRegisteredPayload,
} from '../../core/events/carbon.event-payloads';
import { EVENTS } from '../../core/events/carbon.events';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  @OnEvent(EVENTS.USER_REGISTERED, { async: true })
  async onUserRegistered(payload: UserRegisteredPayload) {
    this.logger.log(
      `[Email] Welcome email queued → ${payload.email} (role: ${payload.role})`,
    );
    // Phase 2: integrate SMTP / SendGrid
  }

  @OnEvent(EVENTS.PROJECT_APPROVED, { async: true })
  async onProjectApproved(payload: ProjectApprovedPayload) {
    this.logger.log(
      `[Email] Project approval notification queued → project ${payload.projectId}`,
    );
  }

  @OnEvent(EVENTS.PROJECT_REJECTED, { async: true })
  async onProjectRejected(payload: ProjectRejectedPayload) {
    this.logger.log(
      `[Email] Rejection notification queued → project ${payload.projectId}: ${payload.note ?? ''}`,
    );
  }

  @OnEvent(EVENTS.USER_APPROVED, { async: true })
  async onUserApproved(payload: UserApprovedPayload) {
    this.logger.log(
      `[Email] Account approved notification queued → user ${payload.userId}`,
    );
    // Phase 3: integrate SMTP / SendGrid
  }

  @OnEvent(EVENTS.USER_REJECTED, { async: true })
  async onUserRejected(payload: UserRejectedPayload) {
    this.logger.log(
      `[Email] Account rejected notification queued → user ${payload.userId}: ${payload.note ?? ''}`,
    );
    // Phase 3: integrate SMTP / SendGrid
  }
}
