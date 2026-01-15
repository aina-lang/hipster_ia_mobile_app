import { api } from './client';

export type TextGenerationType = 'blog' | 'social' | 'ad' | 'email' | 'video';
export type ImageStyle = 'realistic' | 'cartoon' | 'sketch';
export type DocumentType = 'legal' | 'business';

export const AiService = {
  chat: async (messages: any[]) => {
    console.log('[AiService] chat called with', messages.length, 'messages');
    try {
      const response = await api.post('/ai/chat', { messages });
      console.log('[AiService] chat response data:', JSON.stringify(response.data, null, 2));
      return response.data.data;
    } catch (error: any) {
      console.error('[AiService] chat error:', error?.response?.data || error.message);
      throw error;
    }
  },

  generateText: async (params: any, type: TextGenerationType) => {
    const response = await api.post('/ai/text', { params, type });
    return response.data.data;
  },

  generateImage: async (params: any, style: ImageStyle) => {
    const response = await api.post('/ai/image', { params, style });
    return response.data.data;
  },

  generateDocument: async (type: DocumentType, params: any) => {
    const response = await api.post('/ai/document', { type, params });
    return response.data.data;
  },

  generateSocial: async (params: any) => {
    const response = await api.post('/ai/social', { params });
    return response.data.data;
  },

  generatePoster: async (params: any) => {
    const response = await api.post('/ai/poster', { params });
    return response.data.data;
  },

  getHistory: async () => {
    const response = await api.get('/ai/history');
    return response.data.data;
  },
};
