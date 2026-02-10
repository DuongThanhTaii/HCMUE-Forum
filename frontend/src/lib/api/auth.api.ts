import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  studentId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    roles: string[];
    studentId?: string;
  };
}

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/api/v1/auth/login', data),

  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/api/v1/auth/register', data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken }),

  logout: () => apiClient.post('/api/v1/auth/logout'),

  forgotPassword: (email: string) => apiClient.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/api/v1/auth/reset-password', { token, newPassword }),
};
