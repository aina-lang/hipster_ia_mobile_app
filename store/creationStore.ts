import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export type CreationCategory = 'Texte' | 'Image' | 'Document' | 'Social' | 'Video' | 'Audio';

export type VisualStyle =
  | 'Noir Dominance'
  | 'Digital Drift'
  | 'Smoke'
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
  | 'Tile Texture'
  | (string & {});

interface CreationState {
  // Selection state
  selectedJob: JobType | null;
  selectedFunction: string | null;
  selectedCategory: CreationCategory | null;
  selectedArchitecture: string | null;
  // Conditional flow state
  selectedStyle: VisualStyle | null;
  uploadedImage: string | null;

  // Input state
  userQuery: string;
  mainTitle: string;
  subTitle: string;
  infoLine: string;
  subject: string;
  colorLeft: string;
  colorRight: string;
  textPromo: string;

  // Actions
  setJob: (job: JobType) => void;
  setFunction: (fn: string, category: CreationCategory) => void;
  setArchitecture: (architectureId: string | null) => void;
  setQuery: (query: string) => void;
  setMainTitle: (title: string) => void;
  setSubTitle: (title: string) => void;
  setInfoLine: (info: string) => void;
  setSubject: (subject: string) => void;
  setColorLeft: (color: string) => void;
  setColorRight: (color: string) => void;
  setTextPromo: (text: string) => void;
  setStyle: (style: VisualStyle) => void;
  setUploadedImage: (uri: string | null) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>()(
  persist(
    (set) => ({
      selectedJob: null,
      selectedFunction: null,
      selectedCategory: null,
      selectedArchitecture: null,
      userQuery: '',
      mainTitle: '',
      subTitle: '',
      infoLine: '',
      subject: '',
      colorLeft: '#FFFFFF',
      colorRight: '#000000',
      textPromo: '',
      selectedStyle: null,
      uploadedImage: null,

      setJob: (job) => set({ selectedJob: job }),
      setFunction: (fn, cat) => set({ selectedFunction: fn, selectedCategory: cat }),
      setArchitecture: (architectureId) => set({ selectedArchitecture: architectureId }),
      setQuery: (query) => set({ userQuery: query }),
      setMainTitle: (title) => set({ mainTitle: title }),
      setSubTitle: (title) => set({ subTitle: title }),
      setInfoLine: (info) => set({ infoLine: info }),
      setSubject: (subject) => set({ subject }),
      setColorLeft: (color) => set({ colorLeft: color }),
      setColorRight: (color) => set({ colorRight: color }),
      setTextPromo: (text) => set({ textPromo: text }),
      setStyle: (style) => set({ selectedStyle: style }),
      setUploadedImage: (uri) => set({ uploadedImage: uri }),

      reset: () =>
        set({
          selectedJob: null,
          selectedFunction: null,
          selectedCategory: null,
          selectedArchitecture: null,
          userQuery: '',
          mainTitle: '',
          subTitle: '',
          infoLine: '',
          colorLeft: '#FFFFFF',
          colorRight: '#000000',
          textPromo: '',
          selectedStyle: null,
          uploadedImage: null,
          subject: '',
        }),
    }),
    {
      name: 'creation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
