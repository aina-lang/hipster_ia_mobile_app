import { create } from 'zustand';
import { TimeSlot } from '../constants/timeBasedMessages';

interface TimeDynamicMessagesStore {
  // State
  lastMessageShown: string | null;
  lastMessageTime: number | null;
  currentSlot: TimeSlot | null;
  shouldShowModal: boolean;

  // Actions
  markMessageAsShown: (message: string, slot: TimeSlot) => void;
  resetLastMessage: () => void;
  setShouldShowModal: (show: boolean) => void;
  reset: () => void;

  // Helpers
  canShowNewMessage: () => boolean;
  getTimeSinceLastMessage: () => number | null;
}

const SHOW_FREQUENCY_MS = 24 * 60 * 60 * 1000; // 24h entre chaque affichage

/**
 * 🎯 Zustand store for time-based message state
 * 
 * Tracks:
 * - Last message shown and when
 * - Whether we should display a new message
 * - Current time slot
 */
export const useTimeDynamicMessagesStore = create<TimeDynamicMessagesStore>((set, get) => ({
  // Initial state
  lastMessageShown: null,
  lastMessageTime: null,
  currentSlot: null,
  shouldShowModal: false,

  // Mark that we've shown a message
  markMessageAsShown: (message: string, slot: TimeSlot) => {
    set({
      lastMessageShown: message,
      lastMessageTime: Date.now(),
      currentSlot: slot,
      shouldShowModal: false,
    });
  },

  // Reset last message tracking
  resetLastMessage: () => {
    set({
      lastMessageShown: null,
      lastMessageTime: null,
      currentSlot: null,
    });
  },

  // Control modal visibility
  setShouldShowModal: (show: boolean) => {
    set({ shouldShowModal: show });
  },

  // Check if we can show a new message (respects frequency limit)
  canShowNewMessage: () => {
    const { lastMessageTime } = get();

    if (!lastMessageTime) {
      // Never shown before
      return true;
    }

    const timeSinceLastMessage = Date.now() - lastMessageTime;
    return timeSinceLastMessage >= SHOW_FREQUENCY_MS;
  },

  // Get time elapsed since last message
  getTimeSinceLastMessage: () => {
    const { lastMessageTime } = get();
    if (!lastMessageTime) return null;
    return Date.now() - lastMessageTime;
  },

  // Full reset
  reset: () => {
    set({
      lastMessageShown: null,
      lastMessageTime: null,
      currentSlot: null,
      shouldShowModal: false,
    });
  },
}));
