import { create } from 'zustand';

interface WelcomeVideoStore {
  videoCompleted: boolean;
  setVideoCompleted: (completed: boolean) => void;
  isReturningFromBack: boolean;
  setIsReturningFromBack: (returning: boolean) => void;
  /** True after navigating from welcome to login/register until welcome regains focus or auth succeeds. */
  openedAuthFromWelcome: boolean;
  isNavigating: boolean;
  markOpenedAuthFromWelcome: () => void;
  clearOpenedAuthFromWelcome: () => void;
  setIsNavigating: (isNavigating: boolean) => void;
  reset: () => void;
}

export const useWelcomeVideoStore = create<WelcomeVideoStore>((set) => ({
  videoCompleted: false,
  setVideoCompleted: (completed: boolean) => set({ videoCompleted: completed }),
  isReturningFromBack: false,
  setIsReturningFromBack: (returning: boolean) => set({ isReturningFromBack: returning }),
  openedAuthFromWelcome: false,
  isNavigating: false,
  markOpenedAuthFromWelcome: () => {
    // Reset returning-from-back state when navigating to auth
    set({ openedAuthFromWelcome: true, isReturningFromBack: false, isNavigating: true });
  },
  clearOpenedAuthFromWelcome: () => set({ openedAuthFromWelcome: false, isNavigating: false }),
  setIsNavigating: (isNavigating: boolean) => set({ isNavigating }),
  reset: () =>
    set({ videoCompleted: false, isReturningFromBack: false, openedAuthFromWelcome: false, isNavigating: false }),
}));
