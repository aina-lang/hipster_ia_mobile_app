import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface NeonBorderInputProps {
  children: React.ReactNode;
  isActive: boolean;
}

const NEON_BLUE = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;

export function NeonBorderInput({ children, isActive }: NeonBorderInputProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loop.current?.stop();
    if (isActive) {
      translateX.setValue(0);
      loop.current = Animated.loop(
        Animated.timing(translateX, { 
          toValue: -800, 
          duration: 2400, 
          easing: Easing.linear, 
          useNativeDriver: true 
        }),
        { resetBeforeIteration: true }
      );
      loop.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => loop.current?.stop();
  }, [isActive]);

  return (
    <View style={nb.wrapper}>
      {isActive && (
        <>
          <View style={nb.clip} pointerEvents="none">
            <Animated.View style={[nb.track, { transform: [{ translateX }] }]}>
              
              <LinearGradient
                            colors={['transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent', 'transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent']}
                            locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                           style={{ width: 1600, height: '100%' }}
                          />
            </Animated.View>
            <View style={nb.mask} />
          </View>
          <View style={nb.bloomMid} pointerEvents="none" />
          <View style={nb.bloomFar} pointerEvents="none" />
        </>
      )}
      {children}
    </View>
  );
}

const nb = StyleSheet.create({
  wrapper:  { position: 'relative' },
  clip:     { 
    position: 'absolute', 
    top: -1, 
    left: -1, 
    right: -1, 
    bottom: -0.5, 
    borderRadius: 13, 
    overflow: 'hidden', 
    zIndex: 2 
  },
  track:    { position: 'absolute', top: 0, bottom: 0, left: 0 },
  mask:     { 
    position: 'absolute', 
    top: 1, 
    left: 1, 
    right: 1, 
    bottom: 0.5, 
    borderRadius: 12, 
    zIndex: 1, 
    backgroundColor: 'transparent' 
  },
  bloomMid: { 
    position: 'absolute', 
    top: -4, 
    left: -4, 
    right: -4, 
    bottom: -4, 
    borderRadius: 15, 
    backgroundColor: 'transparent', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.45, 
    shadowRadius: 12, 
    elevation: 6
  },
  bloomFar: { 
    position: 'absolute', 
    top: -8, 
    left: -8, 
    right: -8, 
    bottom: -8, 
    borderRadius: 20, 
    backgroundColor: 'transparent', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.22, 
    shadowRadius: 24, 
    elevation: 4 
  },
});
