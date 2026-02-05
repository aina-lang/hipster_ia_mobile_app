import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { LucideIcon } from 'lucide-react-native';

interface SelectionCardProps {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  icon: Icon,
  selected,
  onPress,
  fullWidth = false,
  children,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, fullWidth && styles.fullWidth]}
      activeOpacity={0.9}>
      {selected ? (
        <LinearGradient
          colors={[colors.primary.main + '22', colors.primary.main + '08']}
          style={[StyleSheet.absoluteFill, styles.gradientOverlay]}
        />
      ) : null}

      <View style={[styles.inner, selected && styles.innerSelected]}>
        <View style={styles.header}>
          {Icon && (
            <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
              <Icon size={24} color={selected ? '#FFFFFF' : colors.text.secondary} />
            </View>
          )}
          <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
        </View>
        {children && <View style={styles.contentContainer}>{children}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
    flex: 1,
    minHeight: 60,
    // subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inner: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
    transform: [{ scale: 1 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contentContainer: {
    marginTop: 8,
    paddingLeft: 52, // Align with text (40px icon + 12px gap)
  },
  fullWidth: {
    width: '100%',
  },
  selectedContainer: {
    backgroundColor: 'rgba(15,23,42,1)', // Fully opaque or same as card
    borderColor: colors.primary.main,
    borderWidth: 2,
    // stronger elevation when selected
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  innerSelected: {
    transform: [{ scale: 1.02 }],
  },
  gradientOverlay: {
    borderRadius: 16,
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
    backgroundColor: colors.primary.main, // Solid background for icon when selected
  },
  label: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
