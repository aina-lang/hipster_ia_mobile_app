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
  avatarUrl?: string; // Keep avatar if still used elsewhere
  logoUrl?: string;
  brandingColor?: string;
  isEmailVerified: boolean;
  isSetupComplete: boolean;
  job?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  planType?: string;
  promptsLimit?: number;
  imagesLimit?: number;
  videosLimit?: number;
  audioLimit?: number;
  threeDLimit?: number;
  promptsUsed?: number;
  imagesUsed?: number;
  videosUsed?: number;
  audioUsed?: number;
  threeDUsed?: number;
  type?: 'ai' | 'standard';
  name?: string;
  professionalEmail?: string;
  professionalAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  professionalPhone?: string;
  professionalPhone2?: string;
  siret?: string;
  vatNumber?: string;
  websiteUrl?: string;
  referralCode?: string;
  referredBy?: string;
  isAmbassador?: boolean;
  freeMonthsPending?: number;
  isFirstTime?: boolean; // Track if this is user's first time using the app
  isStripeVerified?: boolean; 
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasFinishedOnboarding: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  isFirstTime: boolean; // Track if this is user's first time using the app (independent of auth)
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
  updateProfile: (data: { avatarUrl?: string }) => Promise<void>;
  updateAiProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  finishOnboarding: () => void;
  uploadAvatar: (imageUri: string) => Promise<string>;
  uploadLogo: (profileId: number, imageUri: string) => Promise<string>;
  aiRefreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, password?: string) => Promise<void>;
  setFirstTimeUsed: () => void; // Mark user as having used the app
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasFinishedOnboarding: false,
      isLoading: false,
      isHydrated: false,
      isFirstTime: true, // Default to first time until proven otherwise
      error: null,
      accessToken: null,
      refreshToken: null,

      clearError: () => set({ error: null }),

      finishOnboarding: async () => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (currentUser?.type === 'ai') {
            await api.patch(`/profiles/ai/${currentUser.id}`, {
              isSetupComplete: true,
            });
            set({
              user: {
                ...currentUser,
                isSetupComplete: true,
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

      updateProfile: async (data: { avatarUrl?: string }) => {
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
          const avatarUrl = data?.data?.avatarUrl || data?.avatarUrl;

          // Update local state with functional update to avoid race conditions
          if (avatarUrl) {
            set((state) => ({
              user: state.user ? { ...state.user, avatarUrl } : null,
            }));
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

          const logoUrl = data?.data?.logoUrl || data?.logoUrl;

          // Update local state with functional update to avoid race conditions
          if (logoUrl) {
            set((state) => ({
              user: state.user ? { ...state.user, logoUrl, avatarUrl: logoUrl } : null,
            }));
          }

          set({ isLoading: false });
          return logoUrl;
        } catch (error: any) {
          const message = extractErrorMessage(error, "Erreur lors de l'upload du logo.");
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateAiProfile: async (data: any) => {
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

          set((state) => ({
            user: state.user ? { ...state.user, ...updatedData } : null,
            isLoading: false,
          }));
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

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // Attempt AI first, fallback to standard if not found
          try {
            await api.post('/ai/auth/forgot-password', { email });
          } catch (e: any) {
            if (e.response?.status === 404) {
              await api.post('/forgot-password', { email });
            } else {
              throw e;
            }
          }
          set({ isLoading: false });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Erreur lors de la demande de réinitialisation.');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      verifyResetCode: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          try {
            await api.post('/ai/auth/verify-reset-code', { email, code });
          } catch (e: any) {
            if (e.response?.status === 404 || e.response?.data?.message === 'Utilisateur introuvable.') {
              await api.post('/verify-reset-code', { email, code });
            } else {
              throw e;
            }
          }
          set({ isLoading: false });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Code de vérification invalide ou expiré.');
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email, code, password) => {
        set({ isLoading: true, error: null });
        try {
          try {
            await api.post('/ai/auth/reset-password', { email, code, password });
          } catch (e: any) {
            if (e.response?.status === 404 || e.response?.data?.message === 'Utilisateur introuvable.') {
              await api.post('/reset-password', { email, code, password });
            } else {
              throw e;
            }
          }
          set({ isLoading: false });
        } catch (error: any) {
          const message = extractErrorMessage(error, 'Erreur lors de la réinitialisation du mot de passe.');
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
              type: 'ai', // Ensure type is set
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
              const creditsData = creditsResp.data?.data || creditsResp.data;
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
              type: 'ai',
              isFirstTime: true, // Mark as first time user
            },
            isAuthenticated: true,
            accessToken: resData.access_token,
            refreshToken: resData.refreshToken || resData.refresh_token,
            hasFinishedOnboarding: !!resData.user.isSetupComplete,
            isLoading: false,
          });

          // Fetch AI credits/usage after verifying email (AI register flow)
          try {
            if (resData.user?.type === 'ai') {
              const creditsResp = await api.get('/ai/payment/credits');
              const creditsData = creditsResp.data?.data || creditsResp.data;
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
            // Only attempt to call logout on server if we have a token
            // and don't let a 401 on logout block the local cleanup
            await api.post(endpoint).catch((err) => {
              if (err.response?.status !== 401) {
                console.error('Logout error on server:', err);
              }
            });
          }
        } catch (e) {
          // General error handling if needed, but finally block will run
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

      aiRefreshUser: async () => {
        try {
          const user = get().user;
          if (user?.type === 'ai') {
            const { data: body } = await api.get('/ai/payment/credits');
            const payload = body?.data || body;
            set({ user: { ...user, ...payload } });
          }
        } catch (e) {
          console.warn('[AuthStore] Failed to refresh AI credits', e);
        }
      },

      // Initialize auth on app startup - verify session is still valid
      initializeAuth: async () => {
        try {
          const state = get();
          const accessToken = state.accessToken;

          // If no token stored, stay logged out
          if (!accessToken) {
            // Make sure isAuthenticated is false if no token
            set({
              isAuthenticated: false,
              user: null,
            });
            return;
          }

          // Verify the token is still valid by calling backend
          const user = state.user;

          // If we have a token but no user object, we try to discover who we are
          if (accessToken && !user) {
            console.log('[AuthStore] Token exists but no user object, attempting discovery...');
            try {
              // Try AI profile first as it's the primary focus
              const { data } = await api.get('/ai/me');
              const userData = data?.data || data;
              set({
                user: { ...userData, type: 'ai' },
                isAuthenticated: true,
                hasFinishedOnboarding: !!userData.isSetupComplete,
              });
              return;
            } catch (e) {
              // Fallback to regular user
              try {
                const { data } = await api.get('/users/me');
                const userData = data?.data || data;
                set({
                  user: { ...userData, type: 'standard' },
                  isAuthenticated: true,
                });
                return;
              } catch (e2) {
                // Both failed, token is useless
                throw new Error('User discovery failed');
              }
            }
          }

          if (user?.type === 'ai') {
            // For AI users, verify token with GET /ai/me
            const { data } = await api.get('/ai/me');
            const userData = data?.data || data;

            console.log('[AuthStore] Session verified on startup, user:', userData.email);

            set({
              user: { ...userData, type: 'ai' },
              isAuthenticated: true,
              hasFinishedOnboarding: !!userData.isSetupComplete,
            });
          } else {
            // For regular users (or users with missing type), verify token with GET /users/me
            const { data } = await api.get('/users/me');
            const userData = data?.data || data;

            console.log('[AuthStore] Session verified on startup, user:', userData.email);

            set({
              user: { ...userData, type: 'standard' },
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          console.warn('[AuthStore] Session verification failed during init:', error.message);
          // Token is invalid or expired, logout
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
          });
        }
      },

      setFirstTimeUsed: () => {
        console.log('[AuthStore] setFirstTimeUsed() called - marking user as non-first-time');
        
        // Mark user as no longer on first time - they've used the app
        const currentUser = get().user;
        const updatePayload: { isFirstTime: boolean; user?: User } = { isFirstTime: false };
        
        if (currentUser) {
          updatePayload.user = { ...currentUser, isFirstTime: false };
        }
        
        set(updatePayload);
        console.log('[AuthStore] Store state updated: isFirstTime = false');
        
        // Save isFirstTime to AsyncStorage immediately to persist across app closes
        AsyncStorage.setItem('auth-storage', JSON.stringify({ 
          isFirstTime: false,
          user: currentUser,
          isAuthenticated: get().isAuthenticated,
          hasFinishedOnboarding: get().hasFinishedOnboarding,
          accessToken: get().accessToken,
          refreshToken: get().refreshToken,
        })).then(() => {
          console.log('[AuthStore] Successfully persisted isFirstTime to AsyncStorage');
        }).catch(e => {
          console.warn('[AuthStore] Failed to persist isFirstTime to AsyncStorage:', e);
        });
        
        // Try to persist to backend if user is authenticated
        const state = get();
        if (state.user && state.accessToken) {
          const endpoint = state.user.type === 'ai' ? `/profiles/ai/${state.user.id}` : `/users/${state.user.id}`;
          api.patch(endpoint, { isFirstTime: false }).catch((e) => {
            console.warn('[AuthStore] Failed to persist isFirstTime to backend:', e);
            // Continue anyway - local state is updated
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        console.log('[AuthStore] Hydrating from AsyncStorage:', { isFirstTime: state?.isFirstTime });
        return () => {
          const finalState = useAuthStore.getState();
          console.log('[AuthStore] Hydration complete:', { isFirstTime: finalState.isFirstTime });
          useAuthStore.setState({ isHydrated: true });
        };
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasFinishedOnboarding: state.hasFinishedOnboarding,
        isFirstTime: state.isFirstTime,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
