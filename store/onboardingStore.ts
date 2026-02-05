import { create } from 'zustand';

interface OnboardingState {
  // Step 0: Plan
  selectedPlan: string;
  setPlan: (plan: string) => void;

  // Step 1: Profile & Identity
  lastName: string;
  setProfileData: (data: { lastName: string }) => void;

  // Step 2: Branding
  brandingColor: string;
  logoUri: string | null;
  avatarUri: string | null;
  setBrandingData: (data: {
    brandingColor: string;
    logoUri?: string | null;
    avatarUri?: string | null;
  }) => void;

  // Step 3: Job
  job: string | null;
  setJob: (job: string) => void;

  // Actions
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedPlan: 'curieux',
  setPlan: (plan) => set({ selectedPlan: plan }),

  lastName: '',
  setProfileData: (data) => set((state) => ({ ...state, ...data })),

  brandingColor: '#000000',
  logoUri: null,
  avatarUri: null,
  setBrandingData: (data) => set((state) => ({ ...state, ...data })),

  job: null,
  setJob: (job) => set({ job }),

  reset: () =>
    set({
      selectedPlan: 'curieux',
      lastName: '',
      brandingColor: '#000000',
      logoUri: null,
      avatarUri: null,
      job: null,
    }),
}));
