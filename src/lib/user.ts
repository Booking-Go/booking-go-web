import apiClient from './api';
import type { User } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload for updating the current user's profile. */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  profileImage?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const userApi = {
  /** Fetches the authenticated user's profile. */
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/users/me');
    return data.data;
  },

  /** Updates the authenticated user's profile with the given fields. */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>('/users/me', payload);
    return data.data;
  },
};
