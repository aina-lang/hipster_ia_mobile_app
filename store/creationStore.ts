import { create } from 'zustand';

export type JobType = 
  | 'Artisan'
  | 'Coiffeur / Barber' 
  | 'Restaurant / Snack' 
  | 'Boutique' 
  | 'Agent Immobilier' 
  | 'Coach / Consultant'
  | 'E-commerce'
  | 'Créateur de contenu'
  | 'Service local' 
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
  
  // Input state
  userQuery: string;
  
  // Actions
  setJob: (job: JobType) => void;
  setFunction: (fn: string, category: CreationCategory) => void;
  setContext: (context: ContextType) => void;
  setQuery: (query: string) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  selectedJob: null,
  selectedFunction: null,
  selectedCategory: null,
  selectedContext: null,
  userQuery: '',

  setJob: (job) => set({ selectedJob: job }),
  setFunction: (fn, cat) => set({ selectedFunction: fn, selectedCategory: cat }),
  setContext: (context) => set({ selectedContext: context }),
  setQuery: (query) => set({ userQuery: query }),
  
  reset: () => set({
    selectedJob: null,
    selectedFunction: null,
    selectedCategory: null,
    selectedContext: null,
    userQuery: '',
  }),
}));
