import { create } from 'zustand';

interface WelcomeVideoStore {
  videoCompleted: boolean;
  setVideoCompleted: (completed: boolean) => void;
  isReturningFromBack: boolean;
  setIsReturningFromBack: (returning: boolean) => void;
  /** True after navigating from welcome to login/register until welcome regains focus or auth succeeds. */
  openedAuthFromWelcome: boolean;
  markOpenedAuthFromWelcome: () => void;
  clearOpenedAuthFromWelcome: () => void;
  reset: () => void;
}

export const useWelcomeVideoStore = create<WelcomeVideoStore>((set) => ({
  videoCompleted: false,
  setVideoCompleted: (completed: boolean) => set({ videoCompleted: completed }),
  isReturningFromBack: false,
  setIsReturningFromBack: (returning: boolean) => set({ isReturningFromBack: returning }),
  openedAuthFromWelcome: false,
  markOpenedAuthFromWelcome: () => {
    // Reset returning-from-back state when navigating to auth
    set({ openedAuthFromWelcome: true, isReturningFromBack: false });
  },
  clearOpenedAuthFromWelcome: () => set({ openedAuthFromWelcome: false }),
  reset: () =>
    set({ videoCompleted: false, isReturningFromBack: false, openedAuthFromWelcome: false }),
}));
