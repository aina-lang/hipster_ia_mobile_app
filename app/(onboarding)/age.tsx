import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useAuthStore } from 'store/authStore';

const AGE_RANGES = ['18-24', '25-34', '35-44', '45+'];

export default function AgeScreen() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isEntreprise = user?.aiProfile?.profileType === 'entreprise';
  const totalSteps = isEntreprise ? 4 : 3;

  const handleNext = () => {
    if (selectedAge) {
      if (isEntreprise) {
        router.push('/(onboarding)/business-details');
      } else {
        router.push('/(onboarding)/ready');
      }
    }
  };

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={2} totalSteps={totalSteps} />

      <View style={styles.container}>
        <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
          <Text style={styles.title}>Quel âge avez-vous ?</Text>
          <Text style={styles.subtitle}>Cela nous aide à personnaliser vos recommandations.</Text>

          <View style={styles.grid}>
            {AGE_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setSelectedAge(range)}
                activeOpacity={0.7}
                style={[
                  styles.ageCard,
                  selectedAge === range ? styles.selectedCard : styles.unselectedCard,
                ]}>
                <Text
                  style={[
                    styles.ageText,
                    selectedAge === range ? styles.selectedText : styles.unselectedText,
                  ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.buttonContainer}>
          <NeonButton
            title="Continuer"
            onPress={handleNext}
            size="lg"
            variant="premium"
            disabled={!selectedAge}
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
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  ageCard: {
    width: '47%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  unselectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedCard: {
    backgroundColor: 'rgba(32, 60, 142, 0.1)',
    borderColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ageText: {
    fontSize: 18,
    fontWeight: '600',
  },
  unselectedText: {
    color: colors.text.secondary,
  },
  selectedText: {
    color: colors.text.primary,
  },
  buttonContainer: {
    marginBottom: 60,
  },
  button: {
    width: '100%',
  },
});
