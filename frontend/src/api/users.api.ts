/**
 * Users API endpoints
 */
import apiClient from '@/utils/axios';

export interface UserProfile {
  user_id: string;
  email: string;
  role: 'USER' | 'HR';
  created_at: string;
  statistics?: {
    total_expenses: number;
    pending_expenses: number;
    approved_expenses: number;
    total_amount?: number;
  };
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: UserProfile[];
    count: number;
  };
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export const usersApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { email?: string }): Promise<UserProfileResponse> => {
    const response = await apiClient.patch<UserProfileResponse>('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/users/change-password', data);
    return response.data;
  },

  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>('/users/all');
    return response.data;
  },
};

