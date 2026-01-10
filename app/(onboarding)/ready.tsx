import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Rocket, CheckCircle2 } from 'lucide-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useAuthStore } from 'store/authStore';

const { width } = Dimensions.get('window');

export default function ReadyScreen() {
  const { finishOnboarding } = useAuthStore();

  const handleStart = () => {
    finishOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={5} totalSteps={5} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Animated Icon */}
        <Animated.View entering={FadeIn.duration(1000)} style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <Rocket size={70} color={colors.neon.primary} strokeWidth={1.5} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.content}>
          <Text style={styles.title}>C'est tout bon !</Text>

          <Text style={styles.subtitle}>
            Votre profil est configuré. Vous êtes prêt à libérer toute la puissance de Hipster IA.
          </Text>

          <View style={styles.features}>
            <FeatureItem text="Expérience personnalisée" />
            <FeatureItem text="Contenu de qualité pro" />
            <FeatureItem text="Résultats instantanés" />
            <FeatureItem text="Données sécurisées" />
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.buttonContainer}>
          <NeonButton
            title="Démarrer l'aventure"
            onPress={handleStart}
            size="lg"
            variant="premium"
            style={styles.button}
          />

          <NeonButton
            title="Précédent"
            onPress={() => router.back()}
            variant="ghost"
            style={styles.backButton}
          />
        </Animated.View>
      </ScrollView>
    </BackgroundGradient>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.featureItem}>
      <CheckCircle2 size={20} color={colors.neon.primary} style={styles.featureIcon} />
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(32, 60, 142, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(32, 60, 142, 0.3)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  backButton: {
    width: '100%',
  },
});
