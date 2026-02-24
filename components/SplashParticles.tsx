import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  color: string;
  glowColor: string;
}

// Couleurs néon modernes avec couleurs complémentaires pour le glow
const NEON_COLORS = [
  { main: '#00ffff', glow: '#00ffff' },      // Cyan
  { main: '#00d4ff', glow: '#0099ff' },      // Cyan clair
  { main: '#00ff88', glow: '#00ff88' },      // Néon vert
  { main: '#ff00ff', glow: '#ff00ff' },      // Magenta
  { main: '#6366ff', glow: '#4f46e5' },      // Indigo
  { main: '#ffffff', glow: '#00d4ff' },      // Blanc avec glow cyan
];

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => {
    const colorPair = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    return {
      id: `star-${i}`,
      x: Math.random() * width,
      y: Math.random() * height * 1.5,
      size: Math.random() * 3 + 1.5, // 1.5-4.5px
      opacity: Math.random() * 0.4 + 0.3, // 0.3-0.7
      duration: Math.random() * 2000 + 1000, // 1-3s
      color: colorPair.main,
      glowColor: colorPair.glow,
    };
  });
};

const StarParticle = ({ particle }: { particle: Particle }) => {
  const animProgress = useSharedValue(0);

  useEffect(() => {
    // Animation de scintillement dramatique avec phases saccadées
    animProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: particle.duration * 0.25 }),
        withTiming(0.2, { duration: particle.duration * 0.15 }),
        withTiming(0.7, { duration: particle.duration * 0.3 }),
        withTiming(0.3, { duration: particle.duration * 0.3 }),
      ),
      -1,
      true
    );
  }, [particle.duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animProgress.value,
      [0, 1],
      [particle.opacity * 0.3, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      animProgress.value,
      [0, 1],
      [0.6, 1.2],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x - (particle.size * 1.5) / 2,
          top: particle.y - (particle.size * 1.5) / 2,
          width: particle.size * 1.5,
          height: particle.size * 1.5,
          justifyContent: 'center',
          alignItems: 'center',
        },
        animatedStyle,
      ]}
    >
      {/* Shadow/Glow layer */}
      <View
        style={{
          position: 'absolute',
          width: particle.size * 2.5,
          height: particle.size * 2.5,
          borderRadius: particle.size,
          backgroundColor: particle.glowColor,
          opacity: 0.15,
        }}
      />

      {/* Star icon */}
      <Star
        size={particle.size}
        color={particle.color}
        fill={particle.color}
        strokeWidth={1}
      />
    </Animated.View>
  );
};

export const SplashParticles = () => {
  const [particles] = useState(() => generateParticles(80)); // 80 étoiles néon

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {particles.map((particle) => (
        <StarParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};
