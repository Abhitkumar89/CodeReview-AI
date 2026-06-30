import { api } from '@/lib/api';
import type { ApiEnvelope, AuthResponse, User } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
    });
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiEnvelope<{ user: User }>>('/auth/me');
    return data.data.user;
  },

  async updateProfile(payload: { name?: string; avatarColor?: string }): Promise<User> {
    const { data } = await api.patch<ApiEnvelope<{ user: User }>>('/auth/me', payload);
    return data.data.user;
  },
};
