import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
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
  icon?: LucideIcon;
}

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
  icon: Icon,
}: NeonButtonProps) {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Pulse animation (if enabled)
  React.useEffect(() => {
    if (pulse) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false
      );
    }
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const gradientColors =
    variant === 'primary'
      ? colors.gradient.primary
      : variant === 'premium'
        ? colors.gradient.premiumButton
        : ['transparent', 'transparent'];

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: 16 },
    md: { height: 56, paddingHorizontal: 24 },
    lg: { height: 64, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

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
        style={[
          styles.button,
          sizeStyles[size],
          variant === 'primary' && styles.primaryBorder,
          variant === 'outline' && styles.outline,
          variant === 'ghost' && styles.ghost,
          variant === 'primary' && shadows.neonGlow,
          variant === 'premium' && styles.premiumBorder,
          disabled && styles.disabled,
        ]}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <>
            <Text
              style={[
                styles.text,
                { fontSize: textSizes[size] },
                variant === 'outline' && styles.outlineText,
                variant === 'ghost' && styles.ghostText,
                textStyle,
              ]}>
              {title}
            </Text>
            {Icon && (
              <Icon
                size={textSizes[size] + 2}
                color={
                  variant === 'outline' || variant === 'ghost'
                    ? colors.neon.primary
                    : colors.text.primary
                }
                style={styles.icon}
              />
            )}
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 15, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#000000', // Default black background for all neon buttons
  },
  text: {
    color: colors.text.primary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  icon: {
    marginLeft: 4,
  },
  primaryBorder: {
    borderWidth: 1.5,
    borderColor: colors.neon.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.neon.primary,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: colors.neon.primary,
  },
  ghost: {
    backgroundColor: 'rgba(32, 60, 142, 0.1)', // #203c8e with opacity
  },
  ghostText: {
    color: colors.neon.primary,
  },
  premiumBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(32, 60, 142, 0.5)',
    shadowColor: colors.neon.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
