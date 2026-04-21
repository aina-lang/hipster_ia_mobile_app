import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions,
  Animated as RNAnimated, Easing as RNEasing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
import { fonts } from '../../theme/typography';

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

const MODAL_W = Dimensions.get('window').width * 0.85;

// ─── helpers ──────────────────────────────────────────────────────────────────

const getIcon = (type: ModalType, color: string) => {
  switch (type) {
    case 'success':      return <CheckCircle   size={32} color={color} />;
    case 'error':        return <XCircle       size={32} color={color} />;
    case 'warning':      return <AlertTriangle size={32} color={color} />;
    case 'info':         return <Info          size={32} color={color} />;
    case 'confirmation': return <HelpCircle    size={32} color={color} />;
    case 'notification': return <Bell          size={32} color={color} />;
    case 'system':       return <Cpu           size={32} color={color} />;
    default:             return <Info          size={32} color={color} />;
  }
};

const getColor = (type: ModalType): string => {
  switch (type) {
    case 'success':      return '#0fd492'; // emerald tiré vers teal — s'intègre mieux avec le bleu
    case 'error':        return '#fb7185'; // rose-400, plus doux que rose-500 sur fond sombre
    case 'warning':      return '#f5a623'; // amber légèrement assombri
    case 'info':         return colors.blue[400];
    case 'confirmation': return colors.neonBlue;
    case 'loading':      return colors.neonBlueDark;
    case 'notification': return colors.violet[400];
    case 'system':       return colors.gray;
    default:             return colors.neonBlue;
  }
};

// ─── spinning loader ──────────────────────────────────────────────────────────

const LoadingSpinner = ({ color }: { color: string }) => {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return <Animated.View style={animStyle}><Loader2 size={32} color={color} /></Animated.View>;
};

// ─── themed neon border — same mechanic as NeonBorderCard in PlanCard ─────────

export interface ThemedNeonBorderProps {
  children: React.ReactNode;
  color: string;
  cardBg?: string;
  style?: any;
}

export const ThemedNeonBorder = ({ children, color, cardBg = colors.midnightBlue, style }: ThemedNeonBorderProps) => {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loopRef    = useRef<RNAnimated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();
    translateX.setValue(0);
    loopRef.current = RNAnimated.loop(
      RNAnimated.timing(translateX, {
        toValue: -MODAL_W,
        duration: 2500,
        easing: RNEasing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    loopRef.current.start();
    return () => { loopRef.current?.stop(); };
  }, [color]);

  return (
    <View style={[s.neonWrapper, style]}>
      {/* Animated border track */}
      <View style={s.neonClip} pointerEvents="none">
        <RNAnimated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={[
              'transparent', color, color + 'aa', 'transparent',
              'transparent', color, color + 'aa', 'transparent',
            ]}
            locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: MODAL_W * 2, height: '100%' }}
          />
        </RNAnimated.View>
        {/* Inner mask — reveals only the 1px border ring */}
        <View style={[s.neonMask, { backgroundColor: cardBg }]} />
      </View>


      {children}
    </View>
  );
};

// ─── main modal ───────────────────────────────────────────────────────────────

export const GenericModal: React.FC<GenericModalProps> = ({
  visible,
  type       = 'info',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText  = 'Annuler',
  autoClose   = false,
  duration    = 3000,
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
      <View style={s.overlay}>

        {/* Backdrop blur */}
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={s.backdrop}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={type !== 'loading' ? onClose : undefined}
          />
        </Animated.View>

        {/* Card with themed neon border */}
        <Animated.View entering={ZoomIn.duration(300).springify()} exiting={ZoomOut.duration(200)}>
          <ThemedNeonBorder color={themeColor}>
            <View style={s.card}>

              {/* Close button */}
              {type !== 'loading' && onClose && !onConfirm && (
                <TouchableOpacity onPress={onClose} style={s.closeButton}>
                  <X size={18} color="rgba(255,255,255,0.35)" />
                </TouchableOpacity>
              )}

              {/* Icon + texts */}
              <View style={s.topSection}>
                <View style={[s.iconBox, { borderColor: `${themeColor}35`, backgroundColor: `${themeColor}18` }]}>
                  {type === 'loading'
                    ? <LoadingSpinner color={themeColor} />
                    : getIcon(type, themeColor)
                  }
                </View>
                <Text style={s.title}>{title}</Text>
                {message ? <Text style={s.message}>{message}</Text> : null}
              </View>

              {/* Actions */}
              {type !== 'loading' && (
                <View style={s.bottomSection}>
                  {onConfirm ? (
                    <View style={s.actionsRow}>
                      <TouchableOpacity style={s.cancelButton} onPress={onClose}>
                        <Text style={s.cancelText}>{cancelText}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.confirmButton, { backgroundColor: themeColor }]}
                        onPress={onConfirm}
                      >
                        <Text style={s.confirmText}>{confirmText}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[s.confirmButton, s.confirmFull, { borderColor: `${themeColor}55`, backgroundColor: `${themeColor}18` }]}
                      onPress={onClose}
                    >
                      <Text style={[s.confirmText, { color: themeColor }]}>OK</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

            </View>
          </ThemedNeonBorder>
        </Animated.View>

      </View>
    </Modal>
  );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Neon border wrapper ───────────────────────────────────────────────────
  neonWrapper: {
    position: 'relative',
    width: MODAL_W,
  },
  neonClip: {
    position: 'absolute',
    top: -1, left: -1, right: -1, bottom: -0.5,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 2,
  },
  neonTrack: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
  },
  neonMask: {
    position: 'absolute',
    top: 1, left: 1, right: 1, bottom: 0.5,
    borderRadius: 24,
    zIndex: 1,
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    width: MODAL_W,
    backgroundColor: colors.midnightBlue,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 3,
  },

  closeButton: {
    position: 'absolute',
    top: 14, right: 14,
    padding: 4,
    zIndex: 10,
  },

  topSection: {
    padding: 28,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.arimo.bold,
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontFamily: fonts.arimo.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cancelText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  confirmFull: {
    flex: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  confirmText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 0.4,
  },
});