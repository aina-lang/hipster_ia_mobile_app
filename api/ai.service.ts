import * as FileSystem from 'expo-file-system';
import { api } from './client';

export type TextGenerationType =
  | 'blog'
  | 'social'
  | 'ad'
  | 'email'
  | 'video'
  | 'text'
  | 'texte'
  | 'seo';
export type ImageStyle =
  | 'Premium'
  | 'Hero Studio'
  | 'Minimal Studio'
  | 'None'
  | '3d-model'
  | 'analog-film'
  | 'anime'
  | 'cinematic'
  | 'comic-book'
  | 'digital-art'
  | 'enhance'
  | 'fantasy-art'
  | 'isometric'
  | 'line-art'
  | 'low-poly'
  | 'modeling-compound'
  | 'neon-punk'
  | 'origami'
  | 'photographic'
  | 'pixel-art'
  | 'tile-texture';
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

  generateImage: async (params: any, style: ImageStyle, seed?: number) => {
    console.log('[AiService] generateImage:', style, params.job, 'Seed:', seed);
    const referenceImage = params.reference_image;
    const isLocalUri =
      referenceImage &&
      (referenceImage.startsWith('file://') ||
        referenceImage.startsWith('content://') ||
        referenceImage.startsWith('assets-library://') ||
        referenceImage.startsWith('ph://') ||
        referenceImage.startsWith('/'));

    if (isLocalUri) {
      console.log('[AiService] Appending image as binary file:', referenceImage);
      const formData = new FormData();
      // @ts-ignore - React Native FormData supports file URIs
      formData.append('image', {
        uri: referenceImage,
        type: 'image/jpeg',
        name: 'reference.jpg',
      });

      // Remove reference_image and style from params since we're sending them as separate fields
      const { reference_image: _, style: __, ...restParams } = params;
      formData.append('params', JSON.stringify(restParams));
      formData.append('style', style);
      if (seed) {
        formData.append('seed', seed.toString());
      }

      try {
        const response = await api.post('/ai/image', formData);
        console.log('[AiService] generateImage (FormData) response:', response.data.data?.url);
        return response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateImage (FormData) ERROR:', error.message);
        if (error.toJSON)
          console.error('[AiService] Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
        throw error;
      }
    } else {
      console.log('[AiService] Sending image request as JSON');
      try {
        const response = await api.post('/ai/image', { params, style, seed });
        console.log('[AiService] generateImage (JSON) response:', response.data.data?.url);
        return response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateImage (JSON) ERROR:', error.message);
        if (error.toJSON)
          console.error('[AiService] Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
        throw error;
      }
    }
  },

  generateDocument: async (type: DocumentType, params: any) => {
    console.log('[AiService] generateDocument:', type, params.job);
    const response = await api.post('/ai/document', { type, params });
    console.log('[AiService] generateDocument result size:', response.data.data?.content?.length);
    return response.data.data;
  },

  generateSocial: async (params: any, seed?: number) => {
    console.log('[AiService] generateSocial:', params.job, 'Seed:', seed);
    const referenceImage = params.reference_image;
    const isLocalUri =
      referenceImage &&
      (referenceImage.startsWith('file://') ||
        referenceImage.startsWith('content://') ||
        referenceImage.startsWith('assets-library://') ||
        referenceImage.startsWith('ph://') ||
        referenceImage.startsWith('/'));

    if (isLocalUri) {
      console.log('[AiService] Appending social image as binary file:', referenceImage);
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', {
        uri: referenceImage,
        type: 'image/jpeg',
        name: 'reference.jpg',
      });

      const { reference_image, ...restParams } = params;
      formData.append('params', JSON.stringify(restParams));
      if (seed) {
        formData.append('seed', seed.toString());
      }

      console.log('[AiService] Sending social payload as FormData');
      try {
        const response = await api.post('/ai/social', formData);
        return response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateSocial (FormData) ERROR:', error.message);
        if (error.toJSON)
          console.error('[AiService] Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
        throw error;
      }
    } else {
      console.log('[AiService] Sending social payload as JSON');
      try {
        const response = await api.post('/ai/social', { params, seed });
        return response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateSocial (JSON) ERROR:', error.message);
        if (error.toJSON)
          console.error('[AiService] Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
        throw error;
      }
    }
  },

  generateFlyer: async (params: any, seed?: number) => {
    console.log('[AiService] generateFlyer', 'Seed:', seed);
    const referenceImage = params.reference_image;
    const isLocalUri =
      referenceImage &&
      (referenceImage.startsWith('file://') ||
        referenceImage.startsWith('content://') ||
        referenceImage.startsWith('assets-library://') ||
        referenceImage.startsWith('ph://') ||
        referenceImage.startsWith('/'));

    if (isLocalUri) {
      console.log('[AiService] Appending flyer image as binary file:', referenceImage);
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', {
        uri: referenceImage,
        type: 'image/jpeg',
        name: 'reference.jpg',
      });

      const { reference_image, ...restParams } = params;
      formData.append('params', JSON.stringify(restParams));
      if (seed) {
        formData.append('seed', seed.toString());
      }
      try {
        const response = await api.post('/ai/flyer', formData);
        return response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateFlyer (FormData) ERROR:', error.message);
        if (error.toJSON)
          console.error('[AiService] Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
        throw error;
      }
    } else {
      console.log('[AiService] Sending flyer payload as JSON');
      try {
        const response = await api.post('/ai/flyer', { params, seed });
        return response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateFlyer (JSON) ERROR:', error.message);
        if (error.toJSON)
          console.error('[AiService] Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
        throw error;
      }
    }
  },

  generateVideo: async (params: any, seed?: number) => {
    console.log('[AiService] generateVideo:', params.job);
    const response = await api.post('/ai/video', { params, seed });
    return response.data.data;
  },

  generateAudio: async (params: any, seed?: number) => {
    console.log('[AiService] generateAudio:', params.job);
    const response = await api.post('/ai/audio', { params, seed });
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

  getGroupedConversations: async () => {
    console.log('[AiService] Fetching grouped conversations...');
    try {
      const response = await api.get('/ai/conversations');
      console.log('[AiService] Conversations fetched, count:', response.data.data?.length);
      return response.data.data;
    } catch (e: any) {
      console.error('[AiService] Fetch conversations error:', e.message, e.response?.status);
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
    console.log(`[AiService] DELETE_ITEM CALL -> /ai/history/${id}/delete`);
    try {
      const response = await api.post(`/ai/history/${id}/delete`);
      console.log(`[AiService] DELETE_ITEM SUCCESS -> ID: ${id}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `[AiService] DELETE_ITEM ERROR -> ID: ${id}`,
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  clearHistory: async () => {
    console.log('[AiService] CLEAR_HISTORY CALL -> /ai/history/clear');
    try {
      const response = await api.post('/ai/history/clear');
      console.log('[AiService] CLEAR_HISTORY SUCCESS', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AiService] CLEAR_HISTORY ERROR', error?.response?.data || error.message);
      throw error;
    }
  },

  testPing: async () => {
    console.log('[AiService] PING CALL...');
    try {
      const response = await api.post('/ai/ping', { test: true });
      console.log('[AiService] PING SUCCESS:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AiService] PING ERROR:', error.message);
      if (error.toJSON)
        console.error('[AiService] PING Detailed Error:', JSON.stringify(error.toJSON(), null, 2));
      throw error;
    }
  },
};
