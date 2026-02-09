import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, BASE_URL } from '../api/client';

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
  name?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  profiles?: {
    client?: any;
    employee?: any;
  };
  isSetupComplete?: boolean;
  job?: string;
  brandingColor?: string;
  hasUsedTrial?: boolean;
  promptsLimit?: number;
  imagesLimit?: number;
  videosLimit?: number;
  audioLimit?: number;
  threeDLimit?: number;
  promptsUsed?: number;
  imagesUsed?: number;
  videosUsed?: number;
  audioUsed?: number;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  planType?: string;
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
  type?: 'ai' | 'standard'; // To distinguish between standard and ai users
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasFinishedOnboarding: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (credentials: any) => Promise<void>;
  aiLogin: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  aiRegister: (data: any) => Promise<any>;
  aiVerifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
  updateAiProfile: (data: Partial<User>) => Promise<void>;
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
      accessToken: null,
      refreshToken: null,

      clearError: () => set({ error: null }),

      finishOnboarding: async () => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (currentUser?.aiProfile) {
            await api.patch(`/profiles/ai/${currentUser.aiProfile.id}`, {
              isSetupComplete: true,
            });
            set({
              user: {
                ...currentUser,
                aiProfile: { ...currentUser.aiProfile, isSetupComplete: true },
              },
            });
          }
        } catch (error: any) {
          console.error('[AuthStore] Failed to update backend onboarding status:', error);
          // We continue to set hasFinishedOnboarding true locally
        } finally {
          set({ hasFinishedOnboarding: true, isLoading: false });
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      updateProfile: async (data: { name?: string; avatarUrl?: string }) => {
        set({ isLoading: true, error: null });
        try {
          // Call API to update profile
          const user = get().user;
          const endpoint = user?.type === 'ai' ? '/ai/auth/profile' : '/users/me';
          await api.patch(endpoint, data);

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
          const fullLogoUrl = logoUrl.startsWith('http')
            ? logoUrl
            : `${BASE_URL.replace('/api', '')}${logoUrl}`;

          // Update local state
          const currentUser = get().user;
          if (currentUser && currentUser.aiProfile && currentUser.aiProfile.id === profileId) {
            set({
              user: {
                ...currentUser,
                aiProfile: { ...currentUser.aiProfile, logoUrl: fullLogoUrl },
              },
            });
          }

          set({ isLoading: false });
          return fullLogoUrl;
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
          if (!currentUser) {
            throw new Error('Utilisateur non trouvé');
          }

          console.log('[AuthStore] Updating AI profile data:', data);

          // Everything is now in AiUser, we update the user directly.
          const response = await api.patch(`/profiles/ai/${currentUser.id}`, data);
          const updatedData = response.data.data;
          console.log('[AuthStore] AI profile updated successfully:', updatedData);

          // Map relative paths if necessary
          if (updatedData.logoUrl && !updatedData.logoUrl.startsWith('http')) {
            updatedData.logoUrl = `${BASE_URL.replace('/api', '')}${updatedData.logoUrl}`;
          }

          set({
            user: {
              ...currentUser,
              ...updatedData,
            },
            isLoading: false,
          });
        } catch (error: any) {
          console.error('[AuthStore] Failed to update AI Profile:', error);
          const message = extractErrorMessage(
            error,
            'Erreur lors de la mise à jour du profil professionnel.'
          );
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
            ...data,
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
            accessToken: resData.access_token,
            refreshToken: resData.refresh_token,
            isLoading: false,
          });
        } catch (error: any) {
          const message = extractErrorMessage(
            error,
            'Une erreur est survenue lors de la connexion.'
          );
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      aiLogin: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/ai/auth/login', credentials);
          const resData = data.data;

          console.log(
            '[AuthStore] AI Login Success. User data:',
            JSON.stringify(resData.user, null, 2)
          );

          await AsyncStorage.setItem('access_token', resData.access_token);
          await AsyncStorage.setItem('refresh_token', resData.refresh_token);

          set({
            user: {
              ...resData.user,
            },
            isAuthenticated: true,
            accessToken: resData.access_token,
            refreshToken: resData.refresh_token,
            hasFinishedOnboarding: !!resData.user.isSetupComplete,
            isLoading: false,
          });

          // Fetch AI credits/usage after login
          try {
            if (resData.user?.type === 'ai') {
              const creditsResp = await api.get('/ai/payment/credits');
              const creditsData = creditsResp.data;
              set((state) => {
                const user = state.user;
                if (!user) return state;

                return {
                  user: {
                    ...user,
                    ...creditsData,
                  } as User,
                };
              });
            }
          } catch (e) {
            console.warn('[AuthStore] Failed to fetch AI credits after login', e);
          }
        } catch (error: any) {
          console.error('[AuthStore] AI Login Error:', error);
          const message = extractErrorMessage(
            error,
            'Une erreur est survenue lors de la connexion AI.'
          );
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true, error: null });
        try {
          const payload = {
            ...registerData,
            name: registerData.name || registerData.email.split('@')[0],
            selectedProfile: 'client_marketing',
          };

          const { data } = await api.post('/register', payload);
          set({ isLoading: false });
          return data;
        } catch (error: any) {
          const message = extractErrorMessage(
            error,
            "Une erreur est survenue lors de l'inscription."
          );
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
          const message = extractErrorMessage(
            error,
            "Une erreur est survenue lors de l'inscription AI."
          );
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      aiVerifyEmail: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/ai/auth/verify-email', { email, code });

          // Backend is wrapped by TransformInterceptor:
          // { status, statusCode, message, data: { access_token, refresh_token, user, ... } }
          const resData = data?.data ?? data;

          await AsyncStorage.setItem('access_token', resData.access_token);
          await AsyncStorage.setItem('refresh_token', resData.refresh_token);

          set({
            user: {
              ...resData.user,
            },
            isAuthenticated: true,
            accessToken: resData.access_token,
            refreshToken: resData.refresh_token,
            hasFinishedOnboarding: !!resData.user.isSetupComplete,
            isLoading: false,
          });

          // Fetch AI credits/usage after verifying email (AI register flow)
          try {
            if (resData.user?.type === 'ai') {
              const creditsResp = await api.get('/ai/payment/credits');
              const creditsData = creditsResp.data;
              set((state) => {
                const user = state.user;
                if (!user) return state;

                return {
                  user: {
                    ...user,
                    ...creditsData,
                  } as User,
                };
              });
            }
          } catch (e) {
            console.warn('[AuthStore] Failed to fetch AI credits after verify', e);
          }
        } catch (error: any) {
          const message = extractErrorMessage(error, "Erreur lors de la vérification de l'email.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const token = get().accessToken || (await AsyncStorage.getItem('access_token'));
        try {
          if (token) {
            const user = get().user;
            const endpoint = user?.type === 'ai' ? '/ai/auth/logout' : '/logout';
            await api.post(endpoint);
          }
        } catch (e) {
          console.error('Logout error:', e);
        } finally {
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
          });
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
        hasFinishedOnboarding: state.hasFinishedOnboarding,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
