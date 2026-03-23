import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WelcomeVideoStore {
  videoCompleted: boolean;
  setVideoCompleted: (completed: boolean) => void;
  isReturningFromBack: boolean;
  setIsReturningFromBack: (returning: boolean) => void;
  reset: () => void;
}

export const useWelcomeVideoStore = create<WelcomeVideoStore>()(
  persist(
    (set) => ({
      videoCompleted: false,
      setVideoCompleted: (completed: boolean) => set({ videoCompleted: completed }),
      isReturningFromBack: false,
      setIsReturningFromBack: (returning: boolean) => set({ isReturningFromBack: returning }),
      reset: () => set({ videoCompleted: false, isReturningFromBack: false }),
    }),
    {
      name: 'welcome-video-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
