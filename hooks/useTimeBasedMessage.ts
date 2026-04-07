import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCurrentTimeSlot,
  getTimeSlotConfig,
  TimeSlot,
} from '../constants/timeBasedMessages';

interface MessageState {
  message: string;
  timeSlot: TimeSlot;
  lastMessageIndex: number;
}

const STORAGE_KEY = 'hipster_last_message_state';
const SHOW_FREQUENCY_MS = 24 * 60 * 60 * 1000; // 24 heures entre chaque affichage

/**
 * 🎯 Hook to manage time-based dynamic messages
 * 
 * Features:
 * - Selects a random message based on current hour
 * - Avoids showing the same message twice in a row
 * - Limits display frequency (24h between displays)
 * - Persists state in AsyncStorage
 */
export const useTimeBasedMessage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastShownTime, setLastShownTime] = useState<number | null>(null);

  /**
   * Load last message state from storage
   */
  const loadLastMessage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state: MessageState & { timestamp: number } = JSON.parse(stored);
      return state;
    } catch (error) {
      console.warn('[useTimeBasedMessage] Failed to load last message:', error);
      return null;
    }
  }, []);

  /**
   * Save message state to storage
   */
  const saveMessageState = useCallback(
    async (msg: string, slot: TimeSlot, index: number) => {
      try {
        const state: MessageState & { timestamp: number } = {
          message: msg,
          timeSlot: slot,
          lastMessageIndex: index,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('[useTimeBasedMessage] Failed to save message state:', error);
      }
    },
    []
  );

  /**
   * Generate a new message for the current time slot
   * Avoids repetition of the last message shown
   */
  const generateNewMessage = useCallback(async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentSlot = getCurrentTimeSlot(currentHour);
    const config = getTimeSlotConfig(currentSlot);

    // Load last message to avoid repetition
    const lastState = await loadLastMessage();

    // Get available messages (exclude last message if same slot)
    let availableMessages = config.messages;
    if (lastState?.timeSlot === currentSlot) {
      // Remove the last message from available options
      availableMessages = config.messages.filter(
        (_, idx) => idx !== lastState.lastMessageIndex
      );
    }

    // Pick a random message from available ones
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    const selectedMessage = availableMessages[randomIndex];

    // Find the actual index in the full messages array
    const actualIndex = config.messages.indexOf(selectedMessage);

    // Save state
    await saveMessageState(selectedMessage, currentSlot, actualIndex);

    return {
      message: selectedMessage,
      timeSlot: currentSlot,
    };
  }, [loadLastMessage, saveMessageState]);

  /**
   * Check if enough time has passed since last display
   */
  const shouldShowMessage = useCallback(async (): Promise<boolean> => {
    try {
      const lastState = await loadLastMessage();
      if (!lastState?.timestamp) return true;

      const timeSinceLastShow = Date.now() - lastState.timestamp;
      return timeSinceLastShow >= SHOW_FREQUENCY_MS;
    } catch (error) {
      console.warn('[useTimeBasedMessage] Failed to check frequency:', error);
      return true; // Show if we can't determine
    }
  }, [loadLastMessage]);

  /**
   * Initialize and get the message to display
   */
  const initializeMessage = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check frequency
      const canShow = await shouldShowMessage();
      if (!canShow) {
        console.log('[useTimeBasedMessage] Frequency limit - not showing message');
        setIsLoading(false);
        return null;
      }

      // Generate new message
      const result = await generateNewMessage();
      setMessage(result.message);
      setTimeSlot(result.timeSlot);
      setLastShownTime(Date.now());

      console.log(
        '[useTimeBasedMessage] Message generated:',
        result.message,
        `(${result.timeSlot})`
      );

      return result;
    } catch (error) {
      console.error('[useTimeBasedMessage] Failed to initialize message:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [shouldShowMessage, generateNewMessage]);

  return {
    message,
    timeSlot,
    isLoading,
    lastShownTime,
    initializeMessage,
    reset: () => {
      setMessage(null);
      setTimeSlot(null);
      setLastShownTime(null);
    },
  };
};
