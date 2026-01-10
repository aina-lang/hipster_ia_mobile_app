import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'https://hipster-api.fr/api'; 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          return Promise.reject(error);
        }

        // Determine which refresh endpoint to use based on user type
        // Read from Zustand's persisted storage
        let refreshUrl = `${BASE_URL}/refresh`;
        try {
          const authStorage = await AsyncStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed.state?.user?.type === 'ai') {
              refreshUrl = `${BASE_URL}/ai/auth/refresh`;
            }
          }
        } catch (e) {
          console.error('Error reading auth-storage for refresh:', e);
        }

        const { data } = await axios.post(refreshUrl, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        await AsyncStorage.setItem('access_token', data.access_token);
        await AsyncStorage.setItem('refresh_token', data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // We might want to force a logout in the store here too
        return Promise.reject(refreshError);
      }
    }

    // Always reject for /login, /register, or if it wasn't a 401 we can handle
    return Promise.reject(error);
  }
);
