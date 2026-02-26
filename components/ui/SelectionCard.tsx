import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface SelectionCardProps {
  label: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  icon: Icon,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
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
      </View>

      {/* Label */}
      <Text 
        style={[styles.label, selected && styles.labelSelected]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 140,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
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
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 15,
    zIndex: 1,
    maxHeight: 30,
  },
  labelSelected: {
    color: colors.text.primary,
    fontWeight: '700',
  },
});
