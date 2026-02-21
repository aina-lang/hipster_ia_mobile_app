import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const splashImage = require('../../assets/splashImage.jpeg');

const NEON_BLUE = '#1e9bff';
const NEON_GLOW = '#1a8fff';

export const LoadingTransition = () => {
  // Image landing scale (starts zoomed in, eases to normal)
  const imageScale = useSharedValue(1.18);
  // Opacity flicker for the glow pulse
  const glowOpacity = useSharedValue(0.6);
  // Scale for the title
  const titleScale = useSharedValue(0.85);
  // Sub-title fade in
  const subOpacity = useSharedValue(0);

  useEffect(() => {
    // ── Image landing (zoom-out from 1.18 to 1.0) ──
    imageScale.value = withTiming(1, {
      duration: 2200,
      easing: Easing.out(Easing.cubic),
    });

    // Title scale in (delayed slightly)
    titleScale.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.3)) })
    );

    // Sub-line fade in after 800ms
    subOpacity.value = withDelay(800, withTiming(1, { duration: 700 }));

    // Continuous neon pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true
    );
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: glowOpacity.value,
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(400)}
      style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]}
    >
      {/* Background with landing scale animation */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.Image
          source={splashImage}
          style={[styles.bgImage, imageStyle]}
          resizeMode="contain"
        />
        {/* Dark overlay */}
        <View style={styles.overlay} />
      </View>

      {/* Foreground content */}
      <View style={styles.center}>
        {/* Glow bloom behind title */}
        <Animated.View style={[styles.bloom, titleStyle]} />

        {/* Main neon title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          HIPSTER-IA
        </Animated.Text>

        {/* Sub line */}
        <Animated.Text style={[styles.sub, subStyle]}>
          Créez. Brillez. Maintenant.
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 22, 0.72)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 300,
  },
  bloom: {
    position: 'absolute',
    width: 320,
    height: 120,
    borderRadius: 80,
    backgroundColor: 'transparent',
    shadowColor: NEON_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#ffffff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  sub: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 3,
    color: 'rgba(180, 210, 255, 0.7)',
    textTransform: 'uppercase',
  },
});
