import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Bell,
  Cpu,
  Loader2,
  X,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

export type ModalType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'confirmation'
  | 'loading'
  | 'notification'
  | 'system';

interface GenericModalProps {
  visible: boolean;
  type?: ModalType;
  title: string;
  message?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoClose?: boolean;
  duration?: number;
}

const { width } = Dimensions.get('window');

const getIcon = (type: ModalType, color: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={48} color={color} />;
    case 'error':
      return <XCircle size={48} color={color} />;
    case 'warning':
      return <AlertTriangle size={48} color={color} />;
    case 'info':
      return <Info size={48} color={color} />;
    case 'confirmation':
      return <HelpCircle size={48} color={color} />;
    case 'loading':
      return <Loader2 size={48} color={color} />; // We'll rotate this manually or wrap it
    case 'notification':
      return <Bell size={48} color={color} />;
    case 'system':
      return <Cpu size={48} color={color} />;
    default:
      return <Info size={48} color={color} />;
  }
};

const getColor = (type: ModalType) => {
  switch (type) {
    case 'success':
      return colors.status.success;
    case 'error':
      return colors.status.error;
    case 'warning':
      return colors.status.warning;
    case 'info':
      return colors.status.info;
    case 'confirmation':
      return colors.primary.main;
    case 'loading':
      return colors.primary.light;
    case 'notification':
      return colors.text.accent;
    case 'system':
      return colors.text.muted;
    default:
      return colors.primary.main;
  }
};

const LoadingSpinner = ({ color }: { color: string }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Loader2 size={48} color={color} />
    </Animated.View>
  );
};

export const GenericModal: React.FC<GenericModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  autoClose = false,
  duration = 3000,
}) => {
  const themeColor = getColor(type);

  useEffect(() => {
    if (visible && autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={type !== 'loading' ? onClose : undefined}
          />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          exiting={ZoomOut.duration(200)}
          style={[
            styles.container,
            {
              borderColor: themeColor,
              shadowColor: themeColor,
            },
          ]}>
          {/* Close Button (if not loading) */}
          {type !== 'loading' && onClose && !onConfirm && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: themeColor + '20' }]}>
            {type === 'loading' ? <LoadingSpinner color={themeColor} /> : getIcon(type, themeColor)}
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Actions */}
          <View style={styles.actions}>
            {type === 'confirmation' ? (
              <>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: themeColor }]}
                  onPress={onConfirm}>
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              type !== 'loading' && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: themeColor, width: '100%' }]}
                  onPress={onClose}>
                  <Text style={styles.confirmButtonText}>OK</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: width * 0.85,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  iconContainer: {
    padding: 16,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
