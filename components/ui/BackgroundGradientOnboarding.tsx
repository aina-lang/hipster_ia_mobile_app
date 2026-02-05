import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from './../../theme/colors';

const { width, height } = Dimensions.get('screen');

interface BackgroundGradientProps {
  children?: React.ReactNode;
  blurIntensity?: number;
}

export function BackgroundGradientOnboarding({ children, blurIntensity = 0 }: BackgroundGradientProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/bg-onboarding.png')}
        style={[styles.image, { width, height }]}
        resizeMode="contain"
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      {blurIntensity > 0 && (
        <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFill} tint="dark" />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    // backgroundColor: colors.background.primary,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(2, 6, 23, 0.4)',
  },
});
