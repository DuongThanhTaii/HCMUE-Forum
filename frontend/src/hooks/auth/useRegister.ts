import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@/lib/i18n/routing';
import { authApi, type RegisterRequest } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const t = useTranslations('auth');

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      toast.success(t('registerSuccess'));
      router.push('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Đăng ký thất bại';
      toast.error(message);
    },
  });
}
