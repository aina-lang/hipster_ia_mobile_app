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

interface DeerAnimationProps {
  progress?: number; // 0 to 100
  size?: number;
}

export const DeerAnimation: React.FC<DeerAnimationProps> = ({
  progress = 0,
  size = 150,
}) => {
  // Animation states
  const glowOpacity = useSharedValue(0); // optionnel : glow transparent
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Pulse/Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Progress-based animation
    if (progress > 0) {
      scale.value = withSpring(1 + (progress / 100) * 0.1);

      if (progress % 20 === 0) {
        rotation.value = withSequence(
          withTiming(0.05, { duration: 100 }),
          withTiming(-0.05, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
      }
    }
  }, [progress]);

  // Animated style for logo
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}rad` }],
  }));

  // Glow style (optionnel)
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Glow (optionnel, transparent pour aucun halo) */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: (size * 1.2) / 2,
          },
          glowStyle,
        ]}
      />

      {/* Logo principal */}
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[
          styles.logo,
          { width: size, height: size, marginTop:size *0.4},
          animatedStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    position: 'absolute', // centre absolu

    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1,
    backgroundColor: 'transparent', // pas de couleur bleu
  },
});
