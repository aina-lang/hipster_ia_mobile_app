import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export default function SetupScreen() {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 3000 }), withTiming(1, { duration: 3000 })),
      -1,
      false
    );

    translateY.value = withRepeat(
      withSequence(withTiming(-15, { duration: 3500 }), withTiming(0, { duration: 3500 })),
      -1,
      true
    );
  }, []);

  const deerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={1} totalSteps={5} />

      <View style={styles.container}>
        {/* Animated Deer Image */}
        <Animated.View entering={FadeIn.duration(1200)} style={[styles.imageContainer, deerStyle]}>
          <Image
            source={require('../../assets/onboarding_welcome.png')}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Content */}
        <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.content}>
          <Text style={styles.title}>Configurons votre espace</Text>

          <Text style={styles.subtitle}>
            Quelques questions pour adapter Hipster IA à votre activité (1 minute)
          </Text>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View
          entering={FadeInDown.delay(1000).duration(800)}
          style={styles.buttonContainer}>
          <NeonButton
            title="C'est parti"
            onPress={() => router.push('/(onboarding)/name')}
            size="lg"
            variant="premium"
            style={styles.button}
          />
        </Animated.View>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: width * 0.9,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 60,
  },
  button: {
    width: '100%',
  },
});
