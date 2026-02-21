import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  pulse?: boolean;
  icon?: LucideIcon | React.ReactNode;
}

// Neon blue color constants — matching the screenshot exactly
const NEON_BLUE = '#1a8fff';
const NEON_BLUE_BRIGHT = '#4db8ff';
const NEON_GLOW_COLOR = '#0a6fff';

export function NeonButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  pulse = false,
  icon,
}: NeonButtonProps) {
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (pulse) {
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.7, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        true
      );
    }
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pulse ? pulseOpacity.value : 1,
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  const sizeStyles = {
    sm: { height: 44, paddingHorizontal: 14 },
    md: { height: 58, paddingHorizontal: 20 },
    lg: { height: 66, paddingHorizontal: 24 },
  };

  const textSizes = { sm: 14, md: 17, lg: 19 };

  const IconComponent = typeof icon === 'function' ? icon : null;
  const iconElement = React.isValidElement(icon) ? icon : null;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          <Text
            style={[
              styles.text,
              { fontSize: textSizes[size] },
              variant === 'outline' && styles.outlineText,
              variant === 'ghost' && styles.ghostText,
              (variant === 'primary' || variant === 'premium') && styles.neonText,
              textStyle,
            ]}>
            {title}
          </Text>
          {IconComponent && (
            <IconComponent
              size={textSizes[size] + 2}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? NEON_BLUE_BRIGHT
                  : '#ffffff'
              }
              style={styles.icon}
            />
          )}
          {iconElement}
        </>
      )}
    </>
  );

  // ─── PREMIUM variant — exact match to screenshot ───────────────────────────
  if (variant === 'premium') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, style]}
        activeOpacity={0.85}>

        {/* ── Layer 0: Far outer bloom (largest, most diffuse) ── */}
        {/* <View style={styles.bloomFar} pointerEvents="none" /> */}

        {/* ── Layer 1: Mid bloom ── */}
        {/* <View style={styles.bloomMid} pointerEvents="none" /> */}

        {/* ── Layer 2: Bottom radial floor glow (the big halo on the floor) ── */}
        <View style={styles.floorGlow} pointerEvents="none" />

        {/* ── Layer 3: Tight border glow ── */}
        <View style={[styles.borderGlow, sizeStyles[size]]} pointerEvents="none" />

        {/* ── Layer 4: Main button body ── */}
        <View style={[styles.premiumBody, sizeStyles[size]]}>
          {/* Clipped background container */}
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 14, overflow: 'hidden' }]}>
            {/* Dark inner fill */}
            <LinearGradient
              colors={['#020c1e', '#010810']}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Top edge light reflection */}
            <LinearGradient
              colors={['rgba(80, 170, 255, 0.18)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Center horizontal shimmer */}
            <LinearGradient
              colors={['transparent', 'rgba(40, 130, 255, 0.08)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>

          {/* Content */}
          <View style={styles.contentRow}>
            {renderContent()}
          </View>
        </View>
      </AnimatedTouchable>
    );
  }

  // ─── OTHER variants ────────────────────────────────────────────────────────
  const gradientColors =
    variant === 'primary' ? colors.gradient.primary : ['transparent', 'transparent'];

  const buttonStyles = [
    styles.button,
    sizeStyles[size],
    variant === 'primary' && styles.primaryBorder,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    variant === 'primary' && shadows.neonGlow,
    disabled && styles.disabled,
  ];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
      activeOpacity={0.8}>
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={buttonStyles}>
        {renderContent()}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  // ─── Shared ───────────────────────────────────────────────────────────────
  button: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  /** White text with centered, very blurred neon-blue glow — no offset, pure luminous halo */
  neonText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(80, 180, 255, 0.95)',
                     // very blurred, soft halo
  },
  icon: { marginLeft: 4 },
  primaryBorder: { borderWidth: 1.5, borderColor: "#abf1ff" },
  outline: { borderWidth: 1.5, borderColor: "#abf1ff", backgroundColor: 'transparent' },
  outlineText: { color: "#abf1ff" },
  ghost: { backgroundColor: 'rgba(44, 70, 155, 0.1)' },
  ghostText: { color: "#abf1ff" },
  disabled: { opacity: 0.45 },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10 },

  // ─── Premium neon layers ──────────────────────────────────────────────────

  /** Main button body — dark fill + rounded border */
  premiumBody: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e9bff',          // bright electric blue border
    // iOS shadow for the border glow
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
  },

  /** Tight outer halo — sits just outside the border */
  borderGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 18,
  },

  /** Mid-range bloom */
  bloomMid: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#1060e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },

  /** Far outer diffuse bloom */
  bloomFar: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 28,
    backgroundColor: 'transparent',
    shadowColor: '#0a50cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },

  /** Elliptical floor glow below — controlled, not too wide */
  floorGlow: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    width: 180,
    height: 50,
    borderRadius: 90,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 30,
  },
});