import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const NEON_BLUE = colors.neonBlue;      // #00eaff
const NEON_BLUE_DARK = colors.neonBlueDark; // #1e9bff

interface SocialMediaNeonCardProps {
  children: React.ReactNode;
  onPress: () => void;
  isActive?: boolean;
  cardBg?: string;
  cardWidth?: number;
}

/**
 * 🎨 SOCIAL MEDIA NEON CARD
 * Animated neon border effect that triggers on press
 * Features:
 * - LinearGradient traversing the border (2400ms loop)
 * - Multi-layer glow (bloomMid + bloomFar)
 * - Spring animation on press
 */
export const SocialMediaNeonCard: React.FC<SocialMediaNeonCardProps> = ({
  children,
  onPress,
  isActive = false,
  cardBg = '#030814',
  cardWidth = 160,
}) => {
  const [pressed, setPressed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const scale = useSharedValue(1);

  const isNeonActive = pressed || isActive;

  // ═══════════════════════════════════════════════════
  // Neon Border Animation
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    loopRef.current?.stop();
    if (isNeonActive) {
      translateX.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: -cardWidth * 2,
          duration: 2400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      );
      loopRef.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => loopRef.current?.stop();
  }, [isNeonActive, cardWidth]);

  // Spring animation on press
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    setPressed(true);
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    setPressed(false);
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[s.wrapper, animatedStyle]}
    >
      {/* Neon Border Container */}
      {isNeonActive && (
        <>
          {/* Animated Gradient Track */}
          <View style={s.neonClip} pointerEvents="none">
            <Animated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
              <LinearGradient
                colors={[
                  'transparent',
                  NEON_BLUE,
                  NEON_BLUE_DARK,
                  'transparent',
                  'transparent',
                  NEON_BLUE,
                  NEON_BLUE_DARK,
                  'transparent',
                ]}
                locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  width: cardWidth * 2,
                  height: '100%',
                }}
              />
            </Animated.View>
            <View style={[s.neonMask, { backgroundColor: cardBg }]} />
          </View>

          {/* Multi-layer Bloom Glow */}
          <View style={s.bloomFar} pointerEvents="none" />
          <View style={s.bloomMid} pointerEvents="none" />
          <View style={s.floorGlow} pointerEvents="none" />
        </>
      )}

      {/* Content */}
      {children}
    </AnimatedTouchable>
  );
};

const s = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible',
  },

  // ═══════════════════════════════════════════════════
  // NEON BORDER LAYERS
  // ═══════════════════════════════════════════════════
  neonClip: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 2,
  },
  neonTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  neonMask: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 15,
    zIndex: 1,
    backgroundColor: '#030814',
  },

  // ═══════════════════════════════════════════════════
  // BLOOM GLOW LAYERS (Multi-layer shadow effect)
  // ═══════════════════════════════════════════════════
  bloomMid: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowColor: NEON_BLUE,
    elevation: 6,
  },
  bloomFar: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowColor: NEON_BLUE,
    elevation: 4,
  },
  floorGlow: {
    position: 'absolute',
    bottom: -12,
    left: -8,
    right: -8,
    height: 16,
    borderRadius: 50,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowColor: NEON_BLUE,
    elevation: 3,
  },
});
