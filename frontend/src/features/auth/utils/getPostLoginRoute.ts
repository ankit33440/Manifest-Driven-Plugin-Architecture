export function getPostLoginRoute(roles: string[]) {
  if (roles.includes('SUPERADMIN') || roles.includes('ADMIN')) {
    return '/dashboard';
  }

  if (roles.includes('PROJECT_DEVELOPER')) {
    return '/projects';
  }

  if (roles.includes('VERIFIER')) {
    return '/verifications';
  }

  if (roles.includes('CERTIFIER')) {
    return '/certifications';
  }

  if (roles.includes('BUYER')) {
    return '/marketplace';
  }

  return '/dashboard';
}
