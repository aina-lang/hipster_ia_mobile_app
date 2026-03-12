import * as FileSystem from 'expo-file-system/legacy';
import { api } from './client';

export type TextGenerationType =
  | 'blog'
  | 'social'
  | 'ad'
  | 'email'
  | 'video'
  | 'text'
  | 'texte';
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

/**
 * Copies an image from any URI scheme (ph://, content://, etc.) to a
 * guaranteed `file://` temp path. Returns the local file:// URI.
 */
const ensureLocalFileUri = async (uri: string): Promise<string> => {
  // Already a local file URI
  if (uri.startsWith('file://')) return uri;

  const tmpPath = `${FileSystem.cacheDirectory}hipster_upload_${Date.now()}.jpg`;
  console.log('[AiService] Copying image to local temp file:', tmpPath);
  try {
    await FileSystem.copyAsync({ from: uri, to: tmpPath });
    console.log('[AiService] Image copied successfully:', tmpPath);
    return tmpPath;
  } catch (e: any) {
    console.warn('[AiService] Could not copy image, using original URI:', e.message);
    return uri;
  }
};

/**
 * Builds a FormData object with the image as a binary file for multipart upload.
 */
const buildFormDataWithImage = async (
  imageUri: string,
  params: any,
  extraFields: Record<string, string> = {}
): Promise<FormData> => {
  const localUri = await ensureLocalFileUri(imageUri);
  console.log('[AiService] Building FormData with image URI:', localUri);

  const formData = new FormData();
  // @ts-ignore - React Native FormData supports file URIs for binary upload
  formData.append('image', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'reference.jpg',
  });
  formData.append('params', JSON.stringify(params));
  for (const [key, value] of Object.entries(extraFields)) {
    formData.append(key, value);
  }
  console.log('[AiService] FormData ready with image field');
  return formData;
};

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
      return response.data.data?.data || response.data.data;
    } catch (error: any) {
      console.error('[AiService] chat error:', error?.response?.data || error.message);
      throw error;
    }
  },

  generateText: async (params: any, type: TextGenerationType) => {
    console.log('[AiService] generateText:', type, params.job);
    const response = await api.post('/ai/text', { params, type });
    const result = response.data.data?.data || response.data.data;
    console.log('[AiService] generateText result size:', result?.content?.length);
    return result;
  },

  generateImage: async (params: any, style: ImageStyle, seed?: number) => {
    console.log('[AiService] generateImage:', style, params.job, 'Seed:', seed);
    const referenceImage = params.reference_image;

    if (referenceImage) {
      const { reference_image: _ref, style: _sty, ...restParams } = params;
      const extraFields: Record<string, string> = { style };
      if (seed) extraFields['seed'] = seed.toString();

      const formData = await buildFormDataWithImage(referenceImage, restParams, extraFields);
      try {
        const response = await api.post('/ai/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = response.data.data?.data || response.data.data;
        console.log('[AiService] generateImage (FormData) response:', result?.url);
        return result;
      } catch (error: any) {
        console.error('[AiService] generateImage (FormData) ERROR:', error.message);
        throw error;
      }
    } else {
      try {
        const response = await api.post('/ai/image', { params, style, seed });
        const result = response.data.data?.data || response.data.data;
        console.log('[AiService] generateImage (JSON) response:', result?.url);
        return result;
      } catch (error: any) {
        console.error('[AiService] generateImage (JSON) ERROR:', error.message);
        throw error;
      }
    }
  },

  generateDocument: async (type: DocumentType, params: any) => {
    console.log('[AiService] generateDocument:', type, params.job);
    const response = await api.post('/ai/document', { type, params });
    const result = response.data.data?.data || response.data.data;
    console.log('[AiService] generateDocument result size:', result?.content?.length);
    return result;
  },

  generateSocial: async (params: any, seed?: number) => {
    console.log(
      '[AiService] generateSocial:',
      params.job,
      'Seed:',
      seed,
      'hasImage:',
      !!params.reference_image
    );
    const referenceImage = params.reference_image;

    if (referenceImage) {
      const { reference_image: _ref, ...restParams } = params;
      const extraFields: Record<string, string> = {};
      if (seed) extraFields['seed'] = seed.toString();

      const formData = await buildFormDataWithImage(referenceImage, restParams, extraFields);
      try {
        const response = await api.post('/ai/social', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = response.data.data?.data || response.data.data;
        console.log('[AiService] generateSocial (FormData) response:', Object.keys(result || {}));
        return result;
      } catch (error: any) {
        console.error('[AiService] generateSocial (FormData) ERROR:', error.message);
        throw error;
      }
    } else {
      try {
        const response = await api.post('/ai/social', { params, seed });
        return response.data.data?.data || response.data.data;
      } catch (error: any) {
        console.error('[AiService] generateSocial (JSON) ERROR:', error.message);
        throw error;
      }
    }
  },

  generateFlyer: async (params: any, seed?: number) => {
    console.log('[AiService] generateFlyer', 'Seed:', seed, 'hasImage:', !!params.reference_image);
    const referenceImage = params.reference_image;

    if (referenceImage) {
      const { reference_image: _ref, ...restParams } = params;
      const extraFields: Record<string, string> = {};
      if (seed) extraFields['seed'] = seed.toString();

      const formData = await buildFormDataWithImage(referenceImage, restParams, extraFields);
      try {
        const response = await api.post('/ai/flyer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = response.data.data?.data || response.data.data;
        console.log('[AiService] generateFlyer (FormData) response:', result?.url);
        return result;
      } catch (error: any) {
        console.error('[AiService] generateFlyer (FormData) ERROR:', error.message);
        throw error;
      }
    } else {
      try {
        const response = await api.post('/ai/flyer', { params, seed });
        const result = response.data.data?.data || response.data.data;
        console.log('[AiService] generateFlyer (JSON) response:', result?.url);
        return result;
      } catch (error: any) {
        console.error('[AiService] generateFlyer (JSON) ERROR:', error.message);
        throw error;
      }
    }
  },

  generateVideo: async (params: any, seed?: number) => {
    console.log('[AiService] generateVideo:', params.job);
    const response = await api.post('/ai/video', { params, seed });
    return response.data.data?.data || response.data.data;
  },

  generateAudio: async (params: any, seed?: number) => {
    console.log('[AiService] generateAudio:', params.job);
    const response = await api.post('/ai/audio', { params, seed });
    return response.data.data?.data || response.data.data;
  },

  decrementCredits: async (type: GenerationType) => {
    console.log('[AiService] decrementCredits:', type);
    try {
      const response = await api.post('/ai/payment/decrement', { type });
      const result = response.data.data?.data || response.data.data;
      console.log('[AiService] decrementCredits response:', result);
      return result;
    } catch (error: any) {
      console.error('[AiService] decrementCredits error:', error?.response?.data || error.message);
      throw error;
    }
  },
  getFlyerCategories: async () => {
    console.log('[AiService] Fetching flyer categories...');
    try {
      const response = await api.get('/ai/flyer-categories');
      return response.data.data?.data || response.data.data || response.data;
    } catch (e: any) {
      console.error('[AiService] Fetch flyer categories error:', e.message);
      throw e;
    }
  },
  getHistory: async () => {
    console.log('[AiService] Fetching history...');
    try {
      const response = await api.get('/ai/history');
      const result = response.data.data?.data || response.data.data;
      console.log('[AiService] History fetched, count:', result?.length);
      return result;
    } catch (e: any) {
      console.error('[AiService] Fetch history error:', e.message, e.response?.status);
      throw e;
    }
  },

  getGroupedConversations: async () => {
    console.log('[AiService] Fetching grouped conversations...');
    try {
      const response = await api.get('/ai/conversations');
      const result = response.data.data?.data || response.data.data;
      console.log('[AiService] Conversations fetched, count:', result?.length);
      return result;
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
      return response.data.data?.data || response.data.data || response.data;
    } catch (e: any) {
      console.error('[AiService] Fetch conversation error:', e.message, e.response?.status);
      throw e;
    }
  },

  deleteGeneration: async (id: string) => {
    console.log(`[AiService] DELETE_ITEM CALL -> /ai/history/${id}/delete`);
    try {
      const response = await api.post(`/ai/history/${id}/delete`);
      const result = response.data.data?.data || response.data.data || response.data;
      console.log(`[AiService] DELETE_ITEM SUCCESS -> ID: ${id}`, result);
      return result;
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
      const result = response.data.data?.data || response.data.data || response.data;
      console.log('[AiService] CLEAR_HISTORY SUCCESS', result);
      return result;
    } catch (error: any) {
      console.error('[AiService] CLEAR_HISTORY ERROR', error?.response?.data || error.message);
      throw error;
    }
  },

  getReferralStats: async () => {
    console.log('[AiService] getReferralStats called');
    try {
      const response = await api.get('/referral/stats');
      return response.data.data?.data || response.data.data || response.data;
    } catch (error: any) {
      console.error('[AiService] getReferralStats error:', error?.response?.data || error.message);
      throw error;
    }
  },

  applyReferralCode: async (code: string) => {
    console.log('[AiService] applyReferralCode called with:', code);
    try {
      const response = await api.post('/referral/apply', { code });
      return response.data.data?.data || response.data.data || response.data;
    } catch (error: any) {
      console.error('[AiService] applyReferralCode error:', error?.response?.data || error.message);
      throw error;
    }
  },
};
