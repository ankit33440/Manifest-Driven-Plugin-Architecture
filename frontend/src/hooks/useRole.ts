import { useAuth } from '../providers/AuthProvider';

export function useRole(role: string) {
  const { user } = useAuth();
  return user?.roles.includes(role) ?? false;
}
