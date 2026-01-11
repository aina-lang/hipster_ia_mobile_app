import { api } from './client';

export type TextGenerationType = 'blog' | 'social' | 'ad';
export type ImageStyle = 'realistic' | 'cartoon' | 'sketch';
export type DocumentType = 'legal' | 'business';

export const AiService = {
  chat: async (messages: any[]) => {
    const response = await api.post('/ai/chat', { messages });
    return response.data.data;
  },

  generateText: async (prompt: string, type: TextGenerationType) => {
    const response = await api.post('/ai/text', { prompt, type });
    return response.data.data;
  },

  generateImage: async (prompt: string, style: ImageStyle) => {
    const response = await api.post('/ai/image', { prompt, style });
    return response.data.data;
  },

  generateDocument: async (type: DocumentType, params: any) => {
    const response = await api.post('/ai/document', { type, params });
    return response.data.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/ai/history');
    return response.data.data;
  },
};
