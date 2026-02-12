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

export type ContextType =
  | 'Noël'
  | 'Saint-Valentin'
  | 'Octobre Rose'
  | 'Soldes'
  | 'Été'
  | 'Hiver'
  | 'Lancement'
  | 'Anniversaire'
  | 'Promotion'
  | 'Recrutement'
  | 'Autre'
  | (string & {})
  | null;

export type CreationCategory = 'Texte' | 'Image' | 'Document' | 'Social';

export type VisualStyle = 'Luxe cinématique (foncé)' | 'Luxe minimal (clair)' | 'Monochrome';
export type TextIntention = 'Promotion' | 'Présentation' | 'Storytelling' | 'Conversion directe';

interface CreationState {
  // Selection state
  selectedJob: JobType | null;
  selectedFunction: string | null;
  selectedCategory: CreationCategory | null;
  selectedContext: ContextType | null;
  selectedTone: string | null;
  selectedTarget: string | null;
  workflowAnswers: Record<string, string>;

  // Conditional flow state
  selectedStyle: VisualStyle | null;
  selectedIntention: TextIntention | null;
  uploadedImage: string | null;

  // Input state
  userQuery: string;

  // Actions
  setJob: (job: JobType) => void;
  setFunction: (fn: string, category: CreationCategory) => void;
  setContext: (context: ContextType) => void;
  setTone: (tone: string) => void;
  setTarget: (target: string) => void;
  setWorkflowAnswer: (key: string, value: string) => void;
  setQuery: (query: string) => void;
  setStyle: (style: VisualStyle) => void;
  setIntention: (intention: TextIntention) => void;
  setUploadedImage: (uri: string | null) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  selectedJob: null,
  selectedFunction: null,
  selectedCategory: null,
  selectedContext: null,
  selectedTone: null,
  selectedTarget: null,
  workflowAnswers: {},
  userQuery: '',
  selectedStyle: null,
  selectedIntention: null,
  uploadedImage: null,

  setJob: (job) => set({ selectedJob: job }),
  setFunction: (fn, cat) => set({ selectedFunction: fn, selectedCategory: cat }),
  setContext: (context) => set({ selectedContext: context }),
  setTone: (tone) => set({ selectedTone: tone }),
  setTarget: (target) => set({ selectedTarget: target }),
  setWorkflowAnswer: (key, value) =>
    set((state) => ({ workflowAnswers: { ...state.workflowAnswers, [key]: value } })),
  setQuery: (query) => set({ userQuery: query }),
  setStyle: (style) => set({ selectedStyle: style }),
  setIntention: (intention) => set({ selectedIntention: intention }),
  setUploadedImage: (uri) => set({ uploadedImage: uri }),

  reset: () =>
    set({
      selectedJob: null,
      selectedFunction: null,
      selectedCategory: null,
      selectedContext: null,
      selectedTone: null,
      selectedTarget: null,
      workflowAnswers: {},
      userQuery: '',
      selectedStyle: null,
      selectedIntention: null,
      uploadedImage: null,
    }),
}));
