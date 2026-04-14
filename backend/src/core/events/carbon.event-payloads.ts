export interface ProjectCreatedPayload {
  projectId: string;
  developerId: string;
  name: string;
}

export interface ProjectSubmittedPayload {
  projectId: string;
  developerId: string;
}

export interface ProjectApprovedPayload {
  projectId: string;
  approvedByUserId: string;
  note?: string;
}

export interface ProjectRejectedPayload {
  projectId: string;
  rejectedByUserId: string;
  note?: string;
}

export interface ProjectVerifiedPayload {
  projectId: string;
  verifiedByUserId: string;
  note?: string;
}

export interface ProjectCertifiedPayload {
  projectId: string;
  certifiedByUserId: string;
  note?: string;
}

export interface ProjectStatusChangedPayload {
  projectId: string;
  fromStatus: string;
  toStatus: string;
  changedByUserId: string;
  note?: string;
}

export interface ProjectDocumentAddedPayload {
  projectId: string;
  documentId: string;
  name: string;
}

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserApprovedPayload {
  userId: string;
  approvedByUserId: string;
}

export interface UserRejectedPayload {
  userId: string;
  rejectedByUserId: string;
  note?: string;
}

export interface ProjectClaimedPayload {
  projectId: string;
  claimedByVerifierId: string;
}

export interface ProjectInfoRequestedPayload {
  projectId: string;
  verifierId: string;
  note: string;
}

export interface UserStatusChangedPayload {
  userId: string;
  changedByUserId: string;
  newStatus: string;
  note?: string;
}
