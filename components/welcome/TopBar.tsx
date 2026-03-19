import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  interpolate, 
  Extrapolate, 
  SharedValue, 
  useAnimatedStyle 
} from 'react-native-reanimated';
import { Text } from '../ui/Text';

interface TopBarProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
  userName: string | undefined;
}

export const TopBar = ({ textAnimProgress, isAuthenticated, userName }: TopBarProps) => {
  const insets = useSafeAreaInsets();
  
  const animStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 1],
      [-30, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER IA';

  return (
    <Animated.View 
      style={[
        styles.topBar, 
        { 
          height: isAuthenticated ? 60 + insets.top : 110 + insets.top, 
          paddingTop: insets.top - 10 
        },
        animStyle
      ]}
    >
      <Text h1>{title}</Text>
      {!isAuthenticated && (
        <>
          <Animated.Text style={styles.topBarSubText}>
            L'agence marketing automatisée
          </Animated.Text>
          <Animated.Text style={styles.subLineTextTop}>
            Dans votre poche.
          </Animated.Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  topBarSubText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Arimo-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  subLineTextTop: {
    fontSize: 18,
    fontFamily: 'Brittany-Signature',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: -2,
  },
});
