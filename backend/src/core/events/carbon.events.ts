export const EVENTS = {
  // Project lifecycle
  PROJECT_CREATED: 'project.created',
  PROJECT_SUBMITTED: 'project.submitted',
  PROJECT_CLAIMED: 'project.claimed',
  PROJECT_INFO_REQUESTED: 'project.info_requested',
  PROJECT_APPROVED: 'project.approved',
  PROJECT_REJECTED: 'project.rejected',
  PROJECT_VERIFIED: 'project.verified',
  PROJECT_CERTIFIED: 'project.certified',
  PROJECT_STATUS_CHANGED: 'project.status_changed',
  PROJECT_DOCUMENT_ADDED: 'project.document_added',
  // User lifecycle
  USER_REGISTERED: 'user.registered',
  USER_APPROVED: 'user.approved',
  USER_REJECTED: 'user.rejected',
  USER_SUSPENDED: 'user.suspended',
  USER_REACTIVATED: 'user.reactivated',
  // MRV / Credits
  MRV_SUBMITTED: 'mrv.submitted',
  MRV_VERIFIED: 'mrv.verified',
  CREDIT_ISSUED: 'credit.issued',
  CREDIT_RETIRED: 'credit.retired',
  TRADE_COMPLETED: 'trade.completed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
