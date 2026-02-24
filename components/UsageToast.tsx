import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { colors } from '../theme/colors';

export interface UsageToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const UsageToast: React.FC<UsageToastProps> = ({
  visible,
  message,
  onDismiss,
  duration = 5000,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, onDismiss, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <AlertCircle size={18} color="#ff9900" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={8}>
        <X size={16} color={colors.text.muted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 153, 0, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 153, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
