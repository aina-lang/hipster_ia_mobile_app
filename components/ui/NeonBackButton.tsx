import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface NeonBackButtonProps {
  onPress: () => void;
  size?: number;
}

const NEON_BLUE = colors.neonBlue;

export function NeonBackButton({ onPress, size = 42 }: NeonBackButtonProps) {
  const borderRadius = size / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.wrapper, { width: size, height: size, borderRadius }]}
    >
      <View style={styles.iconGlow}>
        <ArrowLeft size={size * 0.52} color="white" style={styles.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.darkSlateBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    shadowColor: NEON_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});