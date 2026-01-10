import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { LucideIcon } from 'lucide-react-native';

interface SelectionCardProps {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  icon: Icon,
  selected,
  onPress,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        selected && styles.selectedContainer,
      ]}
      activeOpacity={0.8}>
      {Icon && (
        <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
          <Icon size={24} color={selected ? colors.primary.main : colors.text.secondary} />
        </View>
      )}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minHeight: 60,
  },
  fullWidth: {
    width: '100%',
  },
  selectedContainer: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderColor: colors.primary.main,
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
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  label: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  selectedLabel: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});
