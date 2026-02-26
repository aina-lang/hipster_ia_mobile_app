import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SelectionCardProps {
  label: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  icon: Icon,
  selected,
  onPress,
  fullWidth = false,
  children,
  disabled = false,
  variant = 'horizontal',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  return (
    <View style={[styles.wrapper, fullWidth && styles.fullWidth]}>
      {selected && (
        <>
          <View style={styles.bloomFar} pointerEvents="none" />
          <View style={styles.bloomMid} pointerEvents="none" />
          <View style={styles.borderGlow} pointerEvents="none" />
          <View style={styles.floorGlow} pointerEvents="none" />
        </>
      )}

      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[
          styles.container,
          selected && styles.containerSelected,
          variant === 'vertical' && styles.containerVertical,
          disabled && styles.disabled,
          animatedStyle
        ]}
      >
        {/* Inner reflection glow */}
        {selected && (
          <LinearGradient
            colors={['rgba(80, 170, 255, 0.15)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.4 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={[styles.content, variant === 'vertical' && styles.contentVertical]}>
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
            numberOfLines={2}
          >
            {label}
          </Text>
        </View>
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    flex: 1,
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
    flex: undefined,
  },
  container: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    minHeight: 64,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  containerVertical: {
    aspectRatio: 1,
    minHeight: 140,
    padding: 20,
    alignItems: 'center',
  },
  containerSelected: {
    borderColor: '#1e9bff',
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contentVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  childrenContainer: {
    marginTop: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    flex: 1,
  },
  labelVertical: {
    textAlign: 'center',
    fontSize: 15,
    flex: 0,
    lineHeight: 18,
  },
  selectedLabel: {
    color: '#ffffff',
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.45,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
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
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: 'transparent',
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
  },
});
