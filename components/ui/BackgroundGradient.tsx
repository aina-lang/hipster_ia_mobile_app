import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { colors } from './../../theme/colors';

const { width, height } = Dimensions.get('window');

interface BackgroundGradientProps {
  children?: React.ReactNode;
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/bg.jpeg')}
        style={[styles.image, { width, height }]}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
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
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
  },
});
