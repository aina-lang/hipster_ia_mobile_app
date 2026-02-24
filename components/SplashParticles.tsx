import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
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

const { width, height } = Dimensions.get('window');

// Palette néon premium orientée bleu avec variantes
const NEON_COLORS = [
  { main: '#00d4ff', glow: '#0099ff' },      // Cyan bleu principal
  { main: '#00ffff', glow: '#00d4ff' },      // Cyan pur
  { main: '#66e5ff', glow: '#00d4ff' },      // Cyan clair
  { main: '#0099ff', glow: '#0066ff' },      // Bleu profond
  { main: '#00ff88', glow: '#00d4ff' },      // Vert néon (accent)
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
      duration: Math.random() * 8000 + 12000, // 12-20s pour un mouvement lent et espace
      color: colorPair.main,
      glowColor: colorPair.glow,
    };
  });
};

const StarParticle = ({ particle }: { particle: Particle }) => {
  // Mouvements asynchronisés indépendants
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(particle.opacity);

  const durationX = particle.duration * (1 + Math.random() * 0.8); // 12-36s
  const durationY = particle.duration * (1.1 + Math.random() * 0.9); // 13-39s
  const durationRotation = particle.duration * (1.3 + Math.random() * 0.7); // 15-40s
  const durationScale = particle.duration * (0.8 + Math.random() * 0.4); // 9.6-24s

  const rangeX = 80 + Math.random() * 80; // Déplacement horizontal 80-160px
  const rangeY = 120 + Math.random() * 120; // Déplacement vertical 120-240px

  useEffect(() => {
    // Mouvement horizontal asynchronisé - très lent et fluide
    translateX.value = withRepeat(
      withSequence(
        withTiming(rangeX, { 
          duration: durationX * 0.5, 
          easing: Easing.inOut(Easing.sin) 
        }),
        withTiming(-rangeX, { 
          duration: durationX * 0.5, 
          easing: Easing.inOut(Easing.sin) 
        })
      ),
      -1,
      true
    );

    // Mouvement vertical asynchronisé - très lent et organique
    translateY.value = withRepeat(
      withSequence(
        withTiming(-rangeY, { 
          duration: durationY * 0.4, 
          easing: Easing.inOut(Easing.sin) 
        }),
        withTiming(rangeY, { 
          duration: durationY * 0.3, 
          easing: Easing.inOut(Easing.sin) 
        }),
        withTiming(-rangeY * 0.5, { 
          duration: durationY * 0.3, 
          easing: Easing.inOut(Easing.sin) 
        })
      ),
      -1,
      true
    );

    // Rotation fluide continue très lente
    rotation.value = withRepeat(
      withTiming(360, {
        duration: durationRotation * 2, // Rotation très lente
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulsation d'échelle lente et douce
    scaleValue.value = withRepeat(
      withSequence(
        withTiming(1.15, { 
          duration: durationScale * 0.6, 
          easing: Easing.inOut(Easing.sin) 
        }),
        withTiming(0.9, { 
          duration: durationScale * 0.4, 
          easing: Easing.inOut(Easing.sin) 
        })
      ),
      -1,
      true
    );

    // Scintillement d'opacité très lent et subtil
    opacityValue.value = withRepeat(
      withSequence(
        withTiming(1, { 
          duration: particle.duration * 0.5, 
          easing: Easing.inOut(Easing.sin) 
        }),
        withTiming(particle.opacity * 0.5, { 
          duration: particle.duration * 0.5, 
          easing: Easing.inOut(Easing.sin) 
        })
      ),
      -1,
      true
    );
  }, [particle.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scaleValue.value },
    ],
  }));

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
      {/* Shadow/Glow layer - crée l'effet néon */}
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

      {/* Star icon brillant */}
      <Star
        size={particle.size}
        color={particle.color}
        fill={particle.color}
        strokeWidth={1}
      />
    </Animated.View>
  );
};

export const SplashParticles = ({ count = 80 }: { count?: number } = {}) => {
  const [particles] = useState(() => generateParticles(count));

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
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle) => (
        <StarParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};
