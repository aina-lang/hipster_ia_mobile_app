import React, { ReactNode } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface GradientTextProps {
  children: ReactNode;
  colors?: readonly string[];
  style?: TextStyle;
}

export function GradientText({
  children,
  colors: gradientColors = colors.gradient.primary,
  style,
}: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[styles.text, style]}>{children}</Text>}>
      <LinearGradient colors={gradientColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[styles.text, style, styles.transparent]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
  },
  transparent: {
    opacity: 0,
  },
});
