import { create } from 'zustand';

export type JobType =
  | 'Coiffeur'
  | 'Restaurant'
  | 'Boutique'
  | 'Créateur'
  | 'Artisan'
  | 'Service local'
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

interface CreationState {
  // Selection state
  selectedJob: JobType | null;
  selectedFunction: string | null;
  selectedCategory: CreationCategory | null;
  selectedContext: ContextType | null;
  selectedTone: string | null;
  selectedTarget: string | null;
  workflowAnswers: Record<string, string>;

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

  setJob: (job) => set({ selectedJob: job }),
  setFunction: (fn, cat) => set({ selectedFunction: fn, selectedCategory: cat }),
  setContext: (context) => set({ selectedContext: context }),
  setTone: (tone) => set({ selectedTone: tone }),
  setTarget: (target) => set({ selectedTarget: target }),
  setWorkflowAnswer: (key, value) =>
    set((state) => ({ workflowAnswers: { ...state.workflowAnswers, [key]: value } })),
  setQuery: (query) => set({ userQuery: query }),

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
    }),
}));
