import { create } from 'zustand';

interface WelcomeVideoStore {
  videoCompleted: boolean;
  setVideoCompleted: (completed: boolean) => void;
  isReturningFromBack: boolean;
  setIsReturningFromBack: (returning: boolean) => void;
  reset: () => void;
}

export const useWelcomeVideoStore = create<WelcomeVideoStore>((set) => ({
  videoCompleted: false,
  setVideoCompleted: (completed: boolean) => set({ videoCompleted: completed }),
  isReturningFromBack: false,
  setIsReturningFromBack: (returning: boolean) => set({ isReturningFromBack: returning }),
  reset: () => set({ videoCompleted: false, isReturningFromBack: false }),
}));
