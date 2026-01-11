import { create } from 'zustand';

export type JobType = 'Coiffeur' | 'Restaurant' | 'Boutique' | 'Créateur' | 'Artisan' | 'Service local' | (string & {});
export type CreationType = 'Texte' | 'Image' | 'Document';
export type ContextType = 'Noël' | 'Saint-Valentin' | 'Octobre Rose' | 'Soldes' | 'Été' | 'Hiver' | (string & {}) | null;

interface CreationState {
  // Selection state
  selectedJob: JobType | null;
  selectedType: CreationType | null;
  selectedContext: ContextType | null;
  
  // Input state
  userQuery: string;
  
  // Actions
  setJob: (job: JobType) => void;
  setType: (type: CreationType) => void;
  setContext: (context: ContextType) => void;
  setQuery: (query: string) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  selectedJob: null,
  selectedType: null,
  selectedContext: null,
  userQuery: '',

  setJob: (job) => set({ selectedJob: job }),
  setType: (type) => set({ selectedType: type }),
  setContext: (context) => set({ selectedContext: context }),
  setQuery: (query) => set({ userQuery: query }),
  
  reset: () => set({
    selectedJob: null,
    selectedType: null,
    selectedContext: null,
    userQuery: '',
  }),
}));
