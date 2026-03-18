import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  interpolate, 
  Extrapolate, 
  SharedValue, 
  useAnimatedStyle 
} from 'react-native-reanimated';

interface SubTextAnimationProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
}

export const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: SubTextAnimationProps) => {
  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      textAnimProgress?.value ?? 0, 
      [0, 1], 
      [0, -300], 
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );
    
    return { 
      transform: [{ translateY }],
      opacity 
    };
  });

  if (isAuthenticated) {
    return (
      <Animated.View style={animStyle}>
        <Animated.Text style={styles.mainSubText}>CONTENT DE TE REVOIR</Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animStyle}>
      <Animated.Text style={styles.mainSubText}>Créez vos affiches, promotions et publications en quelques secondes.</Animated.Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  mainSubText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Arimo-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    bottom: -520,
    lineHeight: 30,
    paddingHorizontal: 20,
  },
});
