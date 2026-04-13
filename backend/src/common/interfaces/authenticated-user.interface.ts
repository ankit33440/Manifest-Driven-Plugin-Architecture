export interface AuthenticatedUser {
  sub: string;
  email: string;
  status: string;
  roles: string[];
  permissions?: string[];
}
