import { create } from 'zustand';

export type JobType = 'Coiffeur' | 'Restaurant' | 'Boutique' | 'Créateur' | 'Artisan' | 'Service local';
export type CreationType = 'Réseaux sociaux' | 'Site web' | 'Flyers' | 'Promotions' | 'Événements';
export type ContextType = 'Noël' | 'Saint-Valentin' | 'Octobre Rose' | 'Soldes' | 'Été' | 'Hiver' | null;

interface CreationState {
  // Selection state
  selectedJob: JobType | null;
  selectedType: CreationType | null;
  selectedContext: ContextType | null;
  
  // Input state
  userQuery: string;
  isDictating: boolean;
  
  // Actions
  setJob: (job: JobType) => void;
  setType: (type: CreationType) => void;
  setContext: (context: ContextType) => void;
  setQuery: (query: string) => void;
  setDictating: (isDictating: boolean) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  selectedJob: null,
  selectedType: null,
  selectedContext: null,
  userQuery: '',
  isDictating: false,

  setJob: (job) => set({ selectedJob: job }),
  setType: (type) => set({ selectedType: type }),
  setContext: (context) => set({ selectedContext: context }),
  setQuery: (query) => set({ userQuery: query }),
  setDictating: (isDictating) => set({ isDictating }),
  
  reset: () => set({
    selectedJob: null,
    selectedType: null,
    selectedContext: null,
    userQuery: '',
    isDictating: false
  }),
}));
