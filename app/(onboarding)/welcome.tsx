import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { BackgroundGradientOnboarding } from 'components/ui/BackgroundGradientOnboarding';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, finishOnboarding } = useAuthStore();

  const handleStart = async () => {
    router.push('/(onboarding)/packs');
  };

  const handleContact = () => {
    Linking.openURL('mailto:contact@hipster-ia.fr').catch((err) =>
      console.error("Couldn't open mail client", err)
    );
  };

  // Shared values for the logo animation
  const logoScale = useSharedValue(1);
  const logoTranslateY = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withRepeat(withTiming(1.05, { duration: 3000 }), -1, true);
    logoTranslateY.value = withRepeat(withTiming(-10, { duration: 3500 }), -1, true);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }, { translateY: logoTranslateY.value }],
    };
  });

  return (
    <BackgroundGradientOnboarding>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View
            className={'top-[480]'}
            entering={FadeInDown.delay(300).duration(800)}
            style={styles.textContainer}>
            <Text style={styles.title}>Bienvenue sur Hipster IA</Text>
            <Text style={styles.subtitle}>
              Profitez de notre intelligence artificielle pour votre communication
            </Text>
          </Animated.View>
        </View>

        <View style={styles.footerContainer}>
          <Animated.View entering={FadeInDown.delay(600).duration(800)}>
            <NeonButton
              title="Commencer maintenant"
              onPress={handleStart}
              size="lg"
              variant="premium"
              style={styles.button}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(900).duration(800)}>
            <View style={styles.secondaryLinks}>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
                <Text style={styles.loginText}>Déjà un compte ? <Text style={styles.loginHighlight}>Se connecter</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleContact} style={styles.contactLink}>
                <Text style={styles.contactText}>Besoin d'aide ?</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: 50,
  },
  content: {
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  footerContainer: {
    width: '100%',
    gap: 24,
  },
  button: {
    width: '100%',
  },
  contactLink: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  secondaryLinks: {
    alignItems: 'center',
    gap: 12
  },
  loginLink: {
    paddingVertical: 5
  },
  loginText: {
    color: colors.text.secondary,
    fontSize: 14
  },
  loginHighlight: {

    fontWeight: "700"
  }
});
