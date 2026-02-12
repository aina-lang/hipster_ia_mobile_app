import { api } from './client';

export type TextGenerationType = 'blog' | 'social' | 'ad' | 'email' | 'video' | 'text' | 'texte';
export type ImageStyle = 'Monochrome' | 'Hero Studio' | 'Minimal Studio';
export type DocumentType = 'legal' | 'business';
export type GenerationType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'chat';

export const AiService = {
  chat: async (messages: any[], conversationId?: string | null) => {
    console.log(
      '[AiService] chat called with',
      messages.length,
      'messages',
      conversationId ? `(conversation: ${conversationId})` : '(new conversation)'
    );
    try {
      const response = await api.post('/ai/chat', { messages, conversationId });
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
    const referenceImage = params.reference_image;

    if (
      referenceImage &&
      (referenceImage.startsWith('file://') ||
        referenceImage.startsWith('/') ||
        referenceImage.startsWith('content://'))
    ) {
      // Multipart upload
      const formData = new FormData();
      formData.append('style', style);

      // Extract filename from URI
      const filename = referenceImage.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: referenceImage,
        name: filename,
        type: type === 'image/jpg' ? 'image/jpeg' : type,
      } as any);

      // Send other params as a JSON string
      formData.append('params', JSON.stringify(params));

      const response = await api.post('/ai/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

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
    const referenceImage = params.reference_image;

    if (
      referenceImage &&
      (referenceImage.startsWith('file://') ||
        referenceImage.startsWith('/') ||
        referenceImage.startsWith('content://'))
    ) {
      const formData = new FormData();
      const filename = referenceImage.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: referenceImage,
        name: filename,
        type: type === 'image/jpg' ? 'image/jpeg' : type,
      } as any);
      formData.append('params', JSON.stringify(params));

      const response = await api.post('/ai/social', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await api.post('/ai/social', { params });
    console.log('[AiService] generateSocial result keys:', Object.keys(response.data.data || {}));
    return response.data.data;
  },

  generateFlyer: async (params: any) => {
    console.log('[AiService] generateFlyer');
    const referenceImage = params.reference_image;

    if (
      referenceImage &&
      (referenceImage.startsWith('file://') ||
        referenceImage.startsWith('/') ||
        referenceImage.startsWith('content://'))
    ) {
      const formData = new FormData();
      const filename = referenceImage.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: referenceImage,
        name: filename,
        type: type === 'image/jpg' ? 'image/jpeg' : type,
      } as any);
      formData.append('params', JSON.stringify(params));

      const response = await api.post('/ai/flyer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await api.post('/ai/flyer', { params });
    console.log('[AiService] generateFlyer result URL:', response.data.data?.url);
    return response.data.data;
  },

  decrementCredits: async (type: GenerationType) => {
    console.log('[AiService] decrementCredits:', type);
    try {
      const response = await api.post('/ai/payment/decrement', { type });
      console.log('[AiService] decrementCredits response:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('[AiService] decrementCredits error:', error?.response?.data || error.message);
      throw error;
    }
  },

  getHistory: async () => {
    console.log('[AiService] Fetching history...');
    try {
      const response = await api.get('/ai/history');
      console.log('[AiService] History fetched, count:', response.data.data?.length);
      return response.data.data;
    } catch (e: any) {
      console.error('[AiService] Fetch history error:', e.message, e.response?.status);
      throw e;
    }
  },

  getConversation: async (conversationId: string) => {
    console.log('[AiService] Fetching conversation:', conversationId);
    try {
      const response = await api.get(`/ai/history/${conversationId}`);
      console.log('[AiService] Conversation fetched:', response.data);
      return response.data.data || response.data; // Handle both wrapped and unwrapped responses
    } catch (e: any) {
      console.error('[AiService] Fetch conversation error:', e.message, e.response?.status);
      throw e;
    }
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
