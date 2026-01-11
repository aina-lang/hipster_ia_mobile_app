import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './../../theme/colors';

interface BackgroundGradientProps {
  children?: React.ReactNode;
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:colors.background.primary,
  },
  overlay: {
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
  },
});
