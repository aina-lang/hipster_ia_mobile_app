import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const extractErrorMessage = (error: any, defaultMessage: string) => {
  const apiMessage = error.response?.data?.message;
  if (typeof apiMessage === 'string') return apiMessage;
  if (typeof apiMessage === 'object' && apiMessage.message) {
    return Array.isArray(apiMessage.message) ? apiMessage.message[0] : apiMessage.message;
  }
  return defaultMessage;
};

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[]; // Optional for AI users
  isEmailVerified: boolean;
  profiles?: {
    client?: any;
    employee?: any;
  };
  profile?: any; // Specifically for AI platform users
  type?: 'ai' | 'standard'; // To distinguish entre standard and ai users
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasFinishedOnboarding: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  aiLogin: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  aiRegister: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  finishOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasFinishedOnboarding: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      finishOnboarding: () => set({ hasFinishedOnboarding: true }),

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/login', credentials);
          
          const resData = data.data;
          
          await AsyncStorage.setItem('access_token', resData.access_token);
          await AsyncStorage.setItem('refresh_token', resData.refresh_token);
          
          set({ 
            user: resData.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Une erreur est survenue lors de la connexion.');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      aiLogin: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/ai/auth/login', credentials);
          
          const resData = data.data;
          
          await AsyncStorage.setItem('access_token', resData.access_token);
          await AsyncStorage.setItem('refresh_token', resData.refresh_token);
          
          set({ 
            user: resData.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Une erreur est survenue lors de la connexion AI.');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true, error: null });
        try {
          const payload = {
            ...registerData,
            firstName: registerData.firstName || registerData.email.split('@')[0],
            lastName: registerData.lastName || '',
            selectedProfile: 'client_marketing',
          };
          
          const { data } = await api.post('/register', payload);
          set({ isLoading: false });
          return data;
        } catch (error: any) {
          const message = extractErrorMessage(error, "Une erreur est survenue lors de l'inscription.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      aiRegister: async (registerData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/ai/auth/register', registerData);
          set({ isLoading: false });
          return data;
        } catch (error: any) {
          const message = extractErrorMessage(error, "Une erreur est survenue lors de l'inscription AI.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const user = get().user;
          const endpoint = user?.type === 'ai' ? '/ai/auth/logout' : '/logout';
          await api.post(endpoint);
        } catch (e) {
          console.error('Logout error:', e);
        } finally {
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        hasFinishedOnboarding: state.hasFinishedOnboarding 
      }),
    }
  )
);
