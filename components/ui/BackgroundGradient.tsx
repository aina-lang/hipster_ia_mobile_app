import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './../../theme/colors';

interface BackgroundGradientProps {
  children?: React.ReactNode;
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  return (
    <View style={styles.container}>
      {/* Background image is now handled by the layout */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
  },
});
