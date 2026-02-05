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
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (pulse) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
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
    variant === 'primary' ? colors.gradient.primary : ['transparent', 'transparent'];

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: 12 },
    md: { height: 56, paddingHorizontal: 16 },
    lg: { height: 64, paddingHorizontal: 20 },
  };

  const textSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const IconComponent = typeof icon === 'function' ? icon : null;
  const iconElement = React.isValidElement(icon) ? icon : null;

  const buttonStyles = [
    styles.button,
    sizeStyles[size],
    variant === 'primary' && styles.primaryBorder,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    variant === 'primary' && shadows.neonGlow,
    variant === 'premium' && styles.premiumBorder,
    disabled && styles.disabled,
  ];

  const renderContent = () => (
    <>
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
          {IconComponent && (
            <IconComponent
              size={textSizes[size] + 2}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? colors.neon.primary
                  : colors.text.primary
              }
              style={styles.icon}
            />
          )}
          {iconElement}
        </>
      )}
    </>
  );

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
      activeOpacity={0.8}>
      {variant === 'premium' ? (
        <View style={[buttonStyles, { overflow: 'hidden', position: 'relative' }]}>
          {/* Cercle radial blanc au bas centre */}
          <View
            style={{
              position: 'absolute',
              bottom: -110,

              width: 180,
              height: 120,
              borderRadius: 100,
              backgroundColor: 'rgba(255,255,255,0.005)',
              shadowColor: '#ffffff',

              shadowOffset: {
                width: 0,
                height: 18,
              },
              shadowOpacity: 1,
              shadowRadius: 0,

              elevation: 20,
            }}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', colors.background.premium,]}
            start={{ x: 1, y: 0 }} // droite
            end={{ x: 0, y: 0 }}   // gauche
            style={{ ...StyleSheet.absoluteFillObject }}
          />


          {/* Contenu par-dessus */}
          <View style={{ zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {renderContent()}
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyles}>
          {renderContent()}
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
    backgroundColor: 'rgba(44, 70, 155, 0.1)',
  },
  ghostText: {
    color: colors.neon.primary,
  },
  premiumBorder: {
    borderWidth: 1.5,
    borderColor: colors.background.secondary,
    backgroundColor: colors.background.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
});
