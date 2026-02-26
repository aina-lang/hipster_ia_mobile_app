import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { LucideIcon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface SelectionCardProps {
  label: string;
  icon?: any;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  icon: Icon,
  selected,
  onPress,
  fullWidth = false,
  children,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.98, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      style={[styles.wrapper, fullWidth && styles.fullWidth, disabled && styles.disabled, animatedStyle]}
    >
      {selected && (
        <>
          <View style={styles.bloomFar} pointerEvents="none" />
          <View style={styles.bloomMid} pointerEvents="none" />
          <View style={styles.borderGlow} pointerEvents="none" />
        </>
      )}

      <View style={[styles.container, selected && styles.containerSelected]}>
        <View style={styles.header}>
          {Icon && (
            <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
              <Icon size={24} color={selected ? colors.primary.main : 'rgba(255, 255, 255, 0.6)'} />
            </View>
          )}
          <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
        </View>
        {children && <View style={styles.contentContainer}>{children}</View>}
      </View>
    </AnimatedTouchable>
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
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    minHeight: 64,
  },
  containerSelected: {
    borderColor: colors.primary.main + '80',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contentContainer: {
    marginTop: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconContainer: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main + '40',
    borderWidth: 1,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  selectedLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
  borderGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  bloomMid: {
    position: 'absolute',
    inset: -4,
    borderRadius: 20,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 3,
  },
  bloomFar: {
    position: 'absolute',
    inset: -8,
    borderRadius: 24,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 2,
  },
});
