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
  icon?: LucideIcon;
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

  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  return (
    // ── Wrapper externe : overflow visible, contient les glows ──
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      style={[styles.wrapper, fullWidth && styles.fullWidth, disabled && styles.disabled, animatedStyle]}
    >
      {/* Couches de glow — hors du container clippé */}
      {selected && (
        <>
          <View style={styles.bloomFar} pointerEvents="none" />
          <View style={styles.bloomMid} pointerEvents="none" />
          <View style={styles.borderGlow} pointerEvents="none" />
          <View style={styles.floorGlow} pointerEvents="none" />
        </>
      )}

      {/* ── Container principal clippé ── */}
      <View style={[styles.container, selected && styles.containerSelected]}>
        <View style={styles.header}>
          {Icon && (
            <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
              <Icon size={24} color={selected ? '#ffffff' : colors.text.secondary} />
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
  // Wrapper : pas de background, overflow non défini → visible par défaut
  wrapper: {
    marginBottom: 16,
    flex: 1,
    position: 'relative',
  },

  fullWidth: {
    width: '100%',
    flex: undefined,
  },

  // Container clippé : toute la logique visuelle ici
  container: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 64,
    gap: 12,
    // Subtile ombre de profondeur (non-neon)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },

  containerSelected: {
    borderWidth: 2,
    borderColor: '#1e9bff',
    backgroundColor: '#030814',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  contentContainer: {
    marginTop: 8,
    paddingLeft: 52,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedIconContainer: {
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.4)',
  },

  label: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  selectedLabel: {
    color: '#ffffff',
    fontWeight: '700',

  },

  disabled: {
    opacity: 0.45,
  },

  // ── Glow layers — positionnées sur le wrapper (top:0 = même niveau que la bordure) ──

  borderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 14,
  },

  bloomMid: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#0f60e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },

  bloomFar: {
    position: 'absolute',
    top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 4,
  },

  floorGlow: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
    width: '70%',
    height: 36,
    borderRadius: 50,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 22,
    elevation: 18,
  },
});