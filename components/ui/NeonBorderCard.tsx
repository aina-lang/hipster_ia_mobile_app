import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';

const NEON_BLUE = '#00d4ff'; // Keeping local constant for animation specifics if different, but usually should match theme
const NEON_LIGHT = '#1e9bff';
const CARD_W = 340;

interface NeonBorderCardProps {
  children: React.ReactNode;
  isSelected: boolean;
  cardBg?: string;
}

export function NeonBorderCard({ children, isSelected, cardBg = '#030814' }: NeonBorderCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();
    if (isSelected) {
      translateX.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: -CARD_W,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      );
      loopRef.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => {
      loopRef.current?.stop();
    };
  }, [isSelected]);

  return (
    <View style={s.neonWrapper}>
      {isSelected && (
        <View style={s.neonClip} pointerEvents="none">
          <Animated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['transparent', NEON_BLUE, NEON_LIGHT, 'transparent', 'transparent', NEON_BLUE, NEON_LIGHT, 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: CARD_W * 2, height: '100%' }}
            />
          </Animated.View>
          <View style={[s.neonMask, { backgroundColor: cardBg }]} />
        </View>
      )}
      {isSelected && (
        <>
        </>
      )}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  neonWrapper: { position: 'relative' },
  neonClip: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -0.5,
    borderRadius: 21,
    overflow: 'hidden',
    zIndex: 2,
  },
  neonTrack: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 0.5,
    borderRadius: 20,
    zIndex: 1,
  },
});
