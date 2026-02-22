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

const splashImage = require('../../assets/splashNew.jpeg');

// Enhanced neon colors for the deer
const NEON_BLUE = '#00d4ff';
const NEON_GLOW = '#0099ff';
const NEON_LIGHT = '#66e5ff';

export const LoadingTransition = () => {
  // Image landing scale (starts zoomed in, eases to normal)
  const imageScale = useSharedValue(1.15);
  // Glow bloom intensity
  const glowOpacity = useSharedValue(0.4);
  // Scale for the title
  const titleScale = useSharedValue(0.8);
  // Sub-title fade in
  const subOpacity = useSharedValue(0);
  // Particle twinkle effect
  const particleOpacity = useSharedValue(0);

  useEffect(() => {
    // ── Image landing (subtle zoom-out from 1.15 to 1.0) ──
    imageScale.value = withTiming(1.02, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });

    // Title scale in (bouncy entrance with enhanced glow)
    titleScale.value = withDelay(
      400,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.4)) })
    );

    // Sub-line fade in after 900ms
    subOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));

    // Particle twinkle effect
    particleOpacity.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true
      )
    );

    // Enhanced neon pulse for the glow
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
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
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const separatorStyle = useAnimatedStyle(() => ({
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
        {/* Large glow bloom behind title */}
        <Animated.View style={[styles.bloom, bloomStyle]} />

        {/* Secondary bloom for enhanced glow */}
        <Animated.View style={[styles.bloomSecondary, bloomStyle]} />

        {/* Main neon title with intense glow */}
        <Animated.Text style={[styles.title, titleStyle]}>
          HIPSTER-IA
        </Animated.Text>

        {/* Separator line */}
        <Animated.View style={[styles.separator, separatorStyle]} />

        {/* Sub line without neon effect */}
        <Animated.Text style={[styles.sub, subStyle]}>
          Créer avec l'IA, perfectionnez avec l'agence
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
    backgroundColor: 'rgba(5, 8, 22, 0.20)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 350,
  },
  bloom: {
    position: 'absolute',
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'transparent',
    shadowColor: NEON_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  bloomSecondary: {
    position: 'absolute',
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'transparent',
    shadowColor: NEON_LIGHT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#ffffff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  separator: {
    marginTop: 12,
    width: 60,
    height: 2,
    backgroundColor: '#ffffff',
    opacity: 0.8,
  },
  sub: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1,
    color: 'rgba(180, 210, 255, 0.6)',
    textTransform: 'lowercase',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
