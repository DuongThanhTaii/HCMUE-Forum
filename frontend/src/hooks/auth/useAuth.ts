import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some((role) => user?.roles.includes(role));
  };

  const isAdmin = () => hasRole('Admin');
  const isModerator = () => hasAnyRole(['Admin', 'Moderator']);

  return {
    user,
    isAuthenticated,
    logout: clearAuth,
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
  };
}
