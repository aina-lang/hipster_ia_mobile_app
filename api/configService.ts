import { api } from './client';

interface AppConfig {
  stripe?: {
    publishableKey?: string;
  };
}

let cachedConfig: AppConfig | null = null;

export const configService = {
  async getConfig(): Promise<AppConfig> {
    if (cachedConfig) {
      return cachedConfig;
    }

    try {
      const response = await api.get('/ai/auth/config');
      cachedConfig = response.data?.data || response.data;
      return cachedConfig;
    } catch (error) {
      console.error('[Config Service] Error fetching config:', error);
      return {};
    }
  },

  getStripePublishableKey(): string | undefined {
    return cachedConfig?.stripe?.publishableKey;
  },

  clearCache(): void {
    cachedConfig = null;
  },
};
