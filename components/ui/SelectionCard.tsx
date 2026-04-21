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
});
