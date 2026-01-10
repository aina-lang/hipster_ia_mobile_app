import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, glass } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  glowColor?: string;
}

export function GlassCard({ children, style, glowColor }: GlassCardProps) {
  return (
    <View
      style={[
        styles.container,
        glowColor && {
          ...shadows.neonGlow,
          shadowColor: glowColor,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Slate-900 with opacity
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    ...shadows.cardShadow,
  },
});
