import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from './../../theme/colors';

const { width, height } = Dimensions.get('screen');

interface BackgroundGradientProps {
  children?: React.ReactNode;
  blurIntensity?: number;
  darkOverlay?: boolean;
  imageSource?: 'default' | 'splash';
}

export function BackgroundGradientOnboarding({ children, blurIntensity = 0, darkOverlay = false, imageSource = 'default' }: BackgroundGradientProps) {
  const bgImage = imageSource === 'splash' 
    ? require('../../assets/splashImage.jpeg')
    : require('../../assets/bg-onboarding.png');

  const isLightBackground = imageSource === 'default';

  return (
    <View style={styles.container}>
      <Image
        source={bgImage}
        style={[styles.image, { width, height }]}
        resizeMode="contain"
      />
      <View style={[StyleSheet.absoluteFill, isLightBackground ? styles.lightOverlay : styles.overlay]} />
      {blurIntensity > 0 && (
        <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFill} tint="dark" />
      )}
      {/* Dark overlay to focus on content */}
      {darkOverlay && !isLightBackground && <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a11',
    // backgroundColor: colors.background.primary,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
  },
});
