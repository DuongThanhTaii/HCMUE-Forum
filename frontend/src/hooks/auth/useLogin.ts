import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@/lib/i18n/routing';
import { authApi, type LoginRequest } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const t = useTranslations('auth');

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      toast.success(t('loginSuccess'));
      router.push('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || t('invalidCredentials');
      toast.error(message);
    },
  });
}
