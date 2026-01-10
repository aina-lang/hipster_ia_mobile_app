import { create } from 'zustand';
import { api } from '../api/client';
import { useAuthStore } from './authStore';

interface UserStore {
  isUpdating: boolean;
  updateProfile: (data: any) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  isUpdating: false,

  updateProfile: async (data) => {
    set({ isUpdating: true });
    try {
      const user = useAuthStore.getState().user;
      const endpoint = user?.type === 'ai' ? '/ai/auth/profile' : '/users/me';
      const method = user?.type === 'ai' ? 'put' : 'patch';
      
      const response = await api[method](endpoint, data);
      
      // Update the user in the auth store as well
      const updateUser = useAuthStore.getState().updateUser;
      updateUser(response.data);
      
      set({ isUpdating: false });
    } catch (error: any) {
      set({ isUpdating: false });
      console.error('Update profile error:', error.response?.data || error.message);
      throw error;
    }
  },
}));
