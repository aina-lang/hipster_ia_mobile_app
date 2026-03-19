import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { colors } from './../../theme/colors';
import { BlurView } from 'expo-blur';
import { Image } from 'react-native';



const { width, height } = Dimensions.get('window');

interface BackgroundGradientProps {
  children?: React.ReactNode;
  blurIntensity?: number;
  darkOverlay?: boolean;
  imageSource?: 'default' | 'splash';
}

export function BackgroundGradientOnboarding({
  children,
  blurIntensity = 0,
  darkOverlay = false,
  imageSource = 'default',
}: BackgroundGradientProps) {
  const isLightBackground = imageSource === 'default';


  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/background.jpg')}
        style={[styles.image, { width, height }]}
        resizeMode="cover"
      />

      <View
        style={[
          StyleSheet.absoluteFill,
          isLightBackground ? styles.lightOverlay : styles.overlay,
        ]}
      />

      {blurIntensity > 0 && (
        <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFill} tint="dark" />
      )}

      {darkOverlay && <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});