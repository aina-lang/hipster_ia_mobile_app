import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export const BASE_URL = `https://hipster-api.fr/api`; // Pointing to local backend on port 4000
// const BASE_URL = 'https://hipster-api.fr/api'; // Pointing to local backend to fix 401/connectivity issues
console.log('[API] Initializing with BASE_URL:', BASE_URL);
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  async (config) => {
    // Try to get token from AsyncStorage first
    let token = await AsyncStorage.getItem('access_token');

    // Fallback to authStore if AsyncStorage is empty
    if (!token) {
      const { useAuthStore } = require('../store/authStore');
      token = useAuthStore.getState().accessToken;
    }

    // LOGS POUR DEBUGGER LA CONNEXION
    console.log('🚀 [API REQUEST]', config.method?.toUpperCase(), config.url);
    console.log('🔗 [FULL URL]', config.baseURL + (config.url || ''));

    const url = config.url || '';
    const isPublicAuthEndpoint =
      url.includes('/login') || url.includes('/register') || url.includes('/ai/auth'); // includes verify-email, resend-otp, refresh, etc.

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} (Token present)`
      );
    } else {
      // On accepte désormais silencieusement les requêtes sans token,
      // en les loggant simplement en debug pour éviter les faux "bugs".
      if (!isPublicAuthEndpoint) {
        console.log(`[API Request] No token found for ${config.url}`);
      } else {
        console.log(`[API Request] No token (expected) for ${config.url}`);
      }
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url.includes('/login') ||
      originalRequest.url.includes('/register') ||
      originalRequest.url.includes('/ai/auth');

    // If it's a 401 error and not a login/register request, try to refresh
    const isLogout = originalRequest.url.includes('/logout');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && !isLogout) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          const { useAuthStore } = require('../store/authStore');
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Determine which refresh endpoint to use based on user type
        let refreshUrl = `${BASE_URL}/refresh`;
        const { useAuthStore } = require('../store/authStore');
        const userType = useAuthStore.getState().user?.type;

        if (userType === 'ai') {
          refreshUrl = `${BASE_URL}/ai/auth/refresh`;
        }

        const { data } = await axios.post(
          refreshUrl,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        const resData = data.data;

        await AsyncStorage.setItem('access_token', resData.access_token);
        await AsyncStorage.setItem('refresh_token', resData.refresh_token);

        // Update store too
        useAuthStore.getState().updateUser({
          /* no-op just to trigger state sync if needed, but tokens are managed separately in this version */
        });
        // Actually, let's update tokens in store explicitly if we refactored it
        useAuthStore.setState({
          accessToken: resData.access_token,
          refreshToken: resData.refresh_token,
        });

        originalRequest.headers.Authorization = `Bearer ${resData.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and logout
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Always reject for /login, /register, or if it wasn't a 401 we can handle
    return Promise.reject(error);
  }
);
