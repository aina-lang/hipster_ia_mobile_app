import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const extractErrorMessage = (error: any, defaultMessage: string) => {
  const responseData = error.response?.data;
  
  if (!responseData) return defaultMessage;

  // Case 1: Direct message string
  if (typeof responseData.message === 'string') {
    return responseData.message;
  }

  // Case 2: Array of messages (ValidationPipe)
  if (Array.isArray(responseData.message)) {
    return responseData.message[0];
  }

  // Case 3: Message nested in data (sometimes specific API wrappers do this)
  if (responseData.data && typeof responseData.data.message === 'string') {
    return responseData.data.message;
  }

  // Case 4: Top level error property
  if (responseData.error && typeof responseData.error === 'string') {
    return responseData.error;
  }

  return defaultMessage;
};

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  roles?: string[]; // Optional for AI users
  isEmailVerified: boolean;
  profiles?: {
    client?: any;
    employee?: any;
  };
  profile?: any; // Specifically for AI platform users
  aiProfile?: {
    id: number;
    planType: string;
    subscriptionStatus: string;
    credits: number;
    nextRenewalDate?: string;
    profileType: 'particulier' | 'entreprise';
    companyName?: string;
    professionalEmail?: string;
    professionalAddress?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    professionalPhone?: string;
    professionalPhone2?: string;
    siret?: string;
    vatNumber?: string;
    bankDetails?: string;
    websiteUrl?: string;
    logoUrl?: string;
    isSetupComplete: boolean;
  };
  type?: 'ai' | 'standard'; // To distinguish entre standard and ai users
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasFinishedOnboarding: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  aiLogin: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  aiRegister: (data: any) => Promise<void>;
  aiVerifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (data: { firstName: string; lastName: string; avatarUrl?: string }) => Promise<void>;
  updateAiProfile: (data: Partial<User['aiProfile']>) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  finishOnboarding: () => void;
  uploadAvatar: (imageUri: string) => Promise<string>;
  uploadLogo: (profileId: number, imageUri: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasFinishedOnboarding: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      clearError: () => set({ error: null }),

      finishOnboarding: async () => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (currentUser?.aiProfile) {
            await api.patch(`/profiles/ai/${currentUser.aiProfile.id}`, { 
              isSetupComplete: true 
            });
            set({ 
              hasFinishedOnboarding: true,
              user: {
                ...currentUser,
                aiProfile: { ...currentUser.aiProfile, isSetupComplete: true }
              }
            });
          } else {
            set({ hasFinishedOnboarding: true });
          }
          set({ isLoading: false });
        } catch (error: any) {
          console.error('[AuthStore] Failed to finish onboarding:', error);
          set({ hasFinishedOnboarding: true, isLoading: false }); // Fallback to local state if API fails
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      updateProfile: async (data: { lastName: string; avatarUrl?: string }) => {
        set({ isLoading: true, error: null });
        try {
          // Call API to update profile
          await api.patch('/users/me', data);
          
          // Update local state
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...data } });
          }
          set({ isLoading: false });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Erreur lors de la mise à jour du profil.');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      uploadAvatar: async (imageUri: string): Promise<string> => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'avatar.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append('file', {
            uri: imageUri,
            name: filename,
            type,
          } as any);

          const { data } = await api.post('/users/me/avatar', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          // The typical backend response for uploadAvatar returns the user or just the path
          // Based on my recent update to UsersController.uploadMyAvatar, it returns the user object (via update)
          const res = data.data;
          const avatarUrl = res.avatarUrl;

          // Update local state if needed
          const currentUser = get().user;
          if (currentUser && avatarUrl) {
            set({ user: { ...currentUser, avatarUrl } });
          }

          set({ isLoading: false });
          return avatarUrl;
        } catch (error: any) {
          const message = extractErrorMessage(error, "Erreur lors de l'upload de l'avatar.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      uploadLogo: async (profileId: number, imageUri: string): Promise<string> => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'logo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append('file', {
            uri: imageUri,
            name: filename,
            type,
          } as any);

          const { data } = await api.post(`/profiles/ai/${profileId}/logo`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const logoUrl = data.data.logoUrl;

          // Update local state
          const currentUser = get().user;
          if (currentUser && currentUser.aiProfile && currentUser.aiProfile.id === profileId) {
            set({
              user: {
                ...currentUser,
                aiProfile: { ...currentUser.aiProfile, logoUrl },
              },
            });
          }

          set({ isLoading: false });
          return logoUrl;
        } catch (error: any) {
          const message = extractErrorMessage(error, "Erreur lors de l'upload du logo.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateAiProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser || !currentUser.aiProfile) {
            throw new Error('AI Profile non trouvé');
          }

          console.log('[AuthStore] Updating AI Profile:', {
            id: currentUser.aiProfile.id,
            payload: data
          });

          // Call API to update AI profile
          // The backend endpoint is PATCH /profiles/ai/:id
          const response = await api.patch(`/profiles/ai/${currentUser.aiProfile.id}`, data);
          
          console.log('[AuthStore] AI Profile updated successfully:', response.data);

          // Update local state
          set({ 
            user: { 
              ...currentUser, 
              aiProfile: { ...currentUser.aiProfile, ...data } 
            } 
          });
          set({ isLoading: false });
        } catch (error: any) {
          console.error('[AuthStore] Failed to update AI Profile:', error);
          const message = extractErrorMessage(error, "Erreur lors de la mise à jour du profil professionnel.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = get().user;
          if (!user) throw new Error('Utilisateur non connecté');

          const endpoint = user.type === 'ai' ? '/ai/auth/change-password' : '/change-password';

          await api.put(endpoint, {
            id: user.id,
            ...data
          });
          set({ isLoading: false });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Erreur lors du changement de mot de passe.');
          set({ error: message, isLoading: false });
          throw error;
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
          
          console.log('[AuthStore] AI Login Success. User data:', JSON.stringify(resData.user, null, 2));

          await AsyncStorage.setItem('access_token', resData.access_token);
          await AsyncStorage.setItem('refresh_token', resData.refresh_token);
          
          set({ 
            user: resData.user, 
            isAuthenticated: true, 
            hasFinishedOnboarding: !!resData.user.aiProfile?.isSetupComplete,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('[AuthStore] AI Login Error:', error);
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

      aiVerifyEmail: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/ai/auth/verify-email', { email, code });
          
          const resData = data; // Backend returns access_token, refresh_token, user directly
          
          await AsyncStorage.setItem('access_token', resData.access_token);
          await AsyncStorage.setItem('refresh_token', resData.refresh_token);
          
          set({ 
            user: resData.user, 
            isAuthenticated: true, 
            hasFinishedOnboarding: !!resData.user.aiProfile?.isSetupComplete,
            isLoading: false 
          });
        } catch (error: any) {
          const message = extractErrorMessage(error, "Erreur lors de la vérification de l'email.");
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
      onRehydrateStorage: (state) => {
        return () => {
          useAuthStore.setState({ isHydrated: true });
        };
      },
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        hasFinishedOnboarding: state.hasFinishedOnboarding 
      }),
    }
  )
);
