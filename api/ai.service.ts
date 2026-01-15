import { api } from './client';

export type TextGenerationType = 'blog' | 'social' | 'ad' | 'email' | 'video' | 'text' | 'texte';
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
    console.log('[AiService] generateText:', type, params.job);
    const response = await api.post('/ai/text', { params, type });
    console.log('[AiService] generateText result size:', response.data.data?.content?.length);
    return response.data.data;
  },

  generateImage: async (params: any, style: ImageStyle) => {
    console.log('[AiService] generateImage:', style, params.job);
    const response = await api.post('/ai/image', { params, style });
    console.log('[AiService] generateImage result URL:', response.data.data?.url);
    return response.data.data;
  },

  generateDocument: async (type: DocumentType, params: any) => {
    console.log('[AiService] generateDocument:', type, params.job);
    const response = await api.post('/ai/document', { type, params });
    console.log('[AiService] generateDocument result size:', response.data.data?.content?.length);
    return response.data.data;
  },

  generateSocial: async (params: any) => {
    console.log('[AiService] generateSocial:', params.job);
    const response = await api.post('/ai/social', { params });
    console.log('[AiService] generateSocial result keys:', Object.keys(response.data.data || {}));
    return response.data.data;
  },

  generatePoster: async (params: any) => {
    console.log('[AiService] generatePoster');
    const response = await api.post('/ai/poster', { params });
    return response.data.data;
  },

  getHistory: async () => {
    const response = await api.get('/ai/history');
    return response.data.data;
  },

  deleteGeneration: async (id: string) => {
    console.log('[AiService] Requesting deletion of item:', id);
    try {
      await api.post(`/ai/history/${id}/delete`);
      console.log('[AiService] Item deleted successfully:', id);
    } catch (error) {
      console.error('[AiService] Delete item error:', error);
      throw error;
    }
  },

  clearHistory: async () => {
    console.log('[AiService] Requesting clear all history');
    try {
      await api.post('/ai/history/clear');
      console.log('[AiService] History cleared successfully');
    } catch (error) {
      console.error('[AiService] Clear history error:', error);
      throw error;
    }
  },
};
