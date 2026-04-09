export const EVENTS = {
  PROJECT_SUBMITTED: 'project.submitted',
  PROJECT_APPROVED: 'project.approved',
  PROJECT_REJECTED: 'project.rejected',
  MRV_SUBMITTED: 'mrv.submitted',
  MRV_VERIFIED: 'mrv.verified',
  CREDIT_ISSUED: 'credit.issued',
  CREDIT_RETIRED: 'credit.retired',
  TRADE_COMPLETED: 'trade.completed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
