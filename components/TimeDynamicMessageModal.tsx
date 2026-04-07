import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { GenericModal } from './ui/GenericModal';
import { useTimeBasedMessage } from '../hooks/useTimeBasedMessage';

/**
 * 🎯 Component that displays time-based dynamic messages
 *
 * Shows a fun, contextual message based on when the user logs in
 * - Only displays once per 24h
 * - Avoids repeating the same message
 * - Uses the existing GenericModal component with notification type
 */
export const TimeDynamicMessageModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messageText, setMessageText] = useState<string>('');
  const { isAuthenticated } = useAuthStore();
  const { message, timeSlot, isLoading, initializeMessage } = useTimeBasedMessage();

  /**
   * Initialize message on first render after authentication
   */
  useEffect(() => {
    if (!isAuthenticated || visible) {
      return;
    }

    // Initialize the message selection
    const loadMessage = async () => {
      try {
        const result = await initializeMessage();
        if (result?.message) {
          setMessageText(result.message);
          // Small delay to ensure smooth transition
          setTimeout(() => {
            setVisible(true);
          }, 500);
        }
      } catch (error) {
        console.warn('[TimeDynamicMessageModal] Failed to load message:', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      loadMessage();
    }, 800); // Wait a bit for app to settle after login

    return () => clearTimeout(debounceTimer);
  }, [isAuthenticated, visible, initializeMessage]);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    setVisible(false);
    setMessageText('');
  }, []);

  if (!messageText) {
    return null;
  }

  return (
    <GenericModal
      visible={visible}
      type="notification"
      title="✨ Bienvenue"
      message={messageText}
      onClose={handleClose}
      autoClose={true}
      duration={4000}
    />
  );
};
