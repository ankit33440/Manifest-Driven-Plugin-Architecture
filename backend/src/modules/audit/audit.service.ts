import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateAuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Writes an audit trail entry for a domain event or status change. */
  async createLog(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        userId: input.userId ?? null,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
