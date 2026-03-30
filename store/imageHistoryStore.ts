import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeneratedImage {
  id: string;
  url: string;
  title: string;
  description: string;
  format: 'social' | 'flyer' | 'impression-hd' | 'document';
  architecture?: string;
  style?: string;
  thumbnail?: string;
  createdAt: number;
  generationId?: number;
  metadata?: Record<string, any>;
}

interface ImageHistoryStore {
  images: GeneratedImage[];
  addImage: (image: GeneratedImage) => void;
  removeImage: (id: string) => void;
  clearHistory: () => void;
  getImagesByFormat: (format: string) => GeneratedImage[];
  updateImage: (id: string, updates: Partial<GeneratedImage>) => void;
}

export const useImageHistoryStore = create<ImageHistoryStore>()(
  persist(
    (set, get) => ({
      images: [],

      addImage: (image: GeneratedImage) => {
        console.log('[ImageHistoryStore] Adding image:', { id: image.id, format: image.format, url: image.url?.substring(0, 50) });
        set((state) => {
          // Vérifier si l'image existe déjà (par ID)
          const existingIndex = state.images.findIndex(img => img.id === image.id);
          if (existingIndex >= 0) {
            console.log('[ImageHistoryStore] Image already exists, updating...');
            const updated = [...state.images];
            updated[existingIndex] = image;
            return { images: updated };
          }
          // Ajouter à l'avant (images les plus récentes en premier)
          console.log('[ImageHistoryStore] New image added. Total images:', state.images.length + 1);
          return { images: [image, ...state.images] };
        });
      },

      removeImage: (id: string) => {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },

      clearHistory: () => {
        set({ images: [] });
      },

      getImagesByFormat: (format: string) => {
        return get().images.filter((img) => img.format === format);
      },

      updateImage: (id: string, updates: Partial<GeneratedImage>) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...updates } : img
          ),
        }));
      },
    }),
    {
      name: 'image-history-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
