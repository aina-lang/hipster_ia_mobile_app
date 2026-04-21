import { create } from 'zustand';
import * as Network from 'expo-network';

interface NetworkState {
  isConnected: boolean;
  setConnected: (value: boolean) => void;
  checkConnectivity: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true, // Optimistic default

  setConnected: (value) => set({ isConnected: value }),

  checkConnectivity: async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      const connected = !!(state.isConnected && state.isInternetReachable);
      set({ isConnected: connected });
      return connected;
    } catch (e) {
      console.warn('[NetworkStore] Could not check connectivity:', e);
      return true; // Fail open if we can't check
    }
  },
}));
