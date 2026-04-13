import { useAuth } from '../providers/AuthProvider';

export function usePermission(permission: string) {
  const { user } = useAuth();
  return user?.permissions.includes(permission) ?? false;
}
