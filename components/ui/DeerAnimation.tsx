import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface DeerAnimationProps {
  progress?: number; // 0 to 100
  size?: number;
}

export const DeerAnimation: React.FC<DeerAnimationProps> = ({ progress = 0, size = 150 }) => {
  const glowOpacity = useSharedValue(0.3);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Breathing/Pulse animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Progress reaction
    if (progress > 0) {
      scale.value = withSpring(1 + (progress / 100) * 0.1);

      // Subtle rotation based on progress steps
      if (progress % 20 === 0) {
        rotation.value = withSequence(
          withTiming(0.05, { duration: 100 }),
          withTiming(-0.05, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
      }
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}rad` }],
    shadowOpacity: glowOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Animated Glow Background */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
          },
          glowStyle,
        ]}
      />

      {/* Main Deer Logo */}
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[styles.logo, { width: size, height: size }, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.primary.main,
    filter: 'blur(20px)', // Note: blur might not work on all native versions without specific config
    zIndex: 1,
  },
});
