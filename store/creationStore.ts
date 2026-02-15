import { create } from 'zustand';

export type JobType =
  | 'Coiffure & Esthétique'
  | 'Restaurant / Bar'
  | 'Commerce / Boutique'
  | 'Artisans du bâtiment'
  | 'Service local'
  | 'Profession libérale'
  | 'Bien-être / Santé alternative'
  | 'Autre'
  | (string & {});

export type CreationCategory = 'Texte' | 'Image' | 'Document' | 'Social';

export type VisualStyle =
  | 'Premium'
  | 'Hero Studio'
  | 'Minimal Studio'
  | '3D Model'
  | 'Analog Film'
  | 'Anime'
  | 'Cinematic'
  | 'Comic Book'
  | 'Digital Art'
  | 'Enhance'
  | 'Fantasy Art'
  | 'Isometric'
  | 'Line Art'
  | 'Low Poly'
  | 'Modeling Compound'
  | 'Neon Punk'
  | 'Origami'
  | 'Photographic'
  | 'Pixel Art'
  | 'Tile Texture';

interface CreationState {
  // Selection state
  selectedJob: JobType | null;
  selectedFunction: string | null;
  selectedCategory: CreationCategory | null;
  // Conditional flow state
  selectedStyle: VisualStyle | null;
  uploadedImage: string | null;

  // Input state
  userQuery: string;

  // Actions
  setJob: (job: JobType) => void;
  setFunction: (fn: string, category: CreationCategory) => void;
  setQuery: (query: string) => void;
  setStyle: (style: VisualStyle) => void;
  setUploadedImage: (uri: string | null) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  selectedJob: null,
  selectedFunction: null,
  selectedCategory: null,
  userQuery: '',
  selectedStyle: null,
  uploadedImage: null,

  setJob: (job) => set({ selectedJob: job }),
  setFunction: (fn, cat) => set({ selectedFunction: fn, selectedCategory: cat }),
  setQuery: (query) => set({ userQuery: query }),
  setStyle: (style) => set({ selectedStyle: style }),
  setUploadedImage: (uri) => set({ uploadedImage: uri }),

  reset: () =>
    set({
      selectedJob: null,
      selectedFunction: null,
      selectedCategory: null,
      userQuery: '',
      selectedStyle: null,
      uploadedImage: null,
    }),
}));
