import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
<<<<<<< HEAD
import { LucideIcon } from 'lucide-react-native';
=======
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface SelectionCardProps {
  label: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
<<<<<<< HEAD
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'horizontal' | 'vertical';
=======
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  icon: Icon,
  selected,
  onPress,
<<<<<<< HEAD
  fullWidth = false,
  children,
  disabled = false,
  variant = 'horizontal',
=======
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
    glowOpacity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  };

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
<<<<<<< HEAD
      disabled={disabled}
   
      style={[styles.wrapper, fullWidth && styles.fullWidth, disabled && styles.disabled, animatedStyle]}
    >
      {selected && (
        <>
          <View style={styles.bloomFar} pointerEvents="none" />
          <View style={styles.bloomMid} pointerEvents="none" />
          <View style={styles.borderGlow} pointerEvents="none" />
          <View style={styles.floorGlow} pointerEvents="none" />
        </>
      )}

      <View style={[
        styles.container,
        selected && styles.containerSelected,
        variant === 'vertical' && styles.containerVertical
      ]}>
        {/* Inner reflection glow */}
        {selected && (
          <LinearGradient
            colors={['rgba(80, 170, 255, 0.15)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.4 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={[styles.header, variant === 'vertical' && styles.headerVertical]}>
          {Icon && (
            <View style={[
              styles.iconContainer,
              selected && styles.selectedIconContainer,
              variant === 'vertical' && styles.iconContainerVertical
            ]}>
              <Icon size={variant === 'vertical' ? 32 : 24} color={selected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} />
            </View>
          )}
          <Text
            style={[
              styles.label,
              selected && styles.selectedLabel,
              variant === 'vertical' && styles.labelVertical
            ]}
            numberOfLines={variant === 'vertical' ? 2 : 1}
          >
            {label}
          </Text>
=======
      activeOpacity={0.8}
    >
      {/* Neon glow effects on press - Layer 1: Mid bloom */}
      <AnimatedView style={[styles.bloomMid, glowAnimatedStyle]} pointerEvents="none" />

      {/* Layer 2: Floor glow */}
      <AnimatedView style={[styles.floorGlow, glowAnimatedStyle]} pointerEvents="none" />

      {/* Layer 3: Border glow */}
      <AnimatedView style={[styles.borderGlow, glowAnimatedStyle]} pointerEvents="none" />

      {/* Main card body */}
      <View
        style={[
          styles.card,
          selected && styles.cardSelected,
        ]}
      >
        {/* Neon gradients - only show on press */}
        {glowOpacity.value > 0 && (
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 16, overflow: 'hidden' }]}>
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
        )}

        {/* Glow background on selection */}
        {selected && (
          <View style={styles.glowEffect} />
        )}

        {/* Icon Container */}
        <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
          <Icon
            size={28}
            color={selected ? colors.primary.main : 'rgba(255, 255, 255, 0.6)'}
            strokeWidth={1.5}
          />
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
        </View>

        {/* Label */}
        <Text 
          style={[styles.label, selected && styles.labelSelected]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
<<<<<<< HEAD
  fullWidth: {
    width: '100%',
    flex: undefined,
  },
  container: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
=======
  card: {
    height: 140,
    paddingVertical: 14,
    paddingHorizontal: 12,
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
<<<<<<< HEAD
    minHeight: 64,
    justifyContent: 'center',
  },
  containerVertical: {
    aspectRatio: 1,
    minHeight: 140,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSelected: {
    borderColor: '#1e9bff',
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  contentContainer: {
    marginTop: 16,
=======
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardSelected: {
    borderColor: colors.primary.main + '80',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 2,
    shadowColor: colors.primary.main,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  glowEffect: {
    position: 'absolute',
    inset: 0,
    borderRadius: 18,
    backgroundColor: colors.primary.main + '10',
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
<<<<<<< HEAD
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainerVertical: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(30, 155, 255, 0.2)',
    borderColor: '#1e9bff',
    borderWidth: 1.5,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
=======
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    zIndex: 1,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main + '50',
  },
  label: {
    fontSize: 12,
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 15,
    zIndex: 1,
    maxHeight: 30,
  },
<<<<<<< HEAD
  labelVertical: {
    textAlign: 'center',
    fontSize: 14,
    flex: 0,
    lineHeight: 18,
  },
  selectedLabel: {
    color: '#ffffff',
    fontWeight: '800',
=======
  labelSelected: {
    color: colors.text.primary,
    fontWeight: '700',
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
  },
  borderGlow: {
    position: 'absolute',
<<<<<<< HEAD
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
=======
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
<<<<<<< HEAD
    shadowRadius: 20,
    elevation: 10,
  },
  bloomMid: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#0f60e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 6,
  },
  bloomFar: {
    position: 'absolute',
=======
    shadowRadius: 10,
    elevation: 18,
  },
  bloomMid: {
    position: 'absolute',
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: 'transparent',
<<<<<<< HEAD
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 4,
  },
  floorGlow: {
    position: 'absolute',
    bottom: -25,
    alignSelf: 'center',
    width: '80%',
    height: 30,
    borderRadius: 40,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 15,
=======
    shadowColor: '#1060e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  floorGlow: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    width: 140,
    height: 50,
    borderRadius: 70,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 30,
>>>>>>> d2d73e6392765c3f659361d0c7b882ce9ca5fbc2
  },
});
