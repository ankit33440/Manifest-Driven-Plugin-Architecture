export const SYSTEM_ROLE_NAMES = [
  'SUPERADMIN',
  'ADMIN',
  'PROJECT_DEVELOPER',
  'VERIFIER',
  'CERTIFIER',
  'BUYER',
] as const;

export type SystemRoleName = (typeof SYSTEM_ROLE_NAMES)[number];
