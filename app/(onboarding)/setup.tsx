import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { User, Building2 } from 'lucide-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function SetupScreen() {
  const [profileType, setProfileType] = useState<'particulier' | 'entreprise' | null>(null);
  const { updateAiProfile, isLoading } = useAuthStore();

  const handleNext = async () => {
    if (profileType) {
      try {
        await updateAiProfile({ profileType });
        router.push('/(onboarding)/age');
      } catch (error) {
        console.error('Failed to update profile type:', error);
      }
    }
  };

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={1} totalSteps={4} />

      <View style={styles.container}>
        <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
          <Text style={styles.title}>Quel est votre profil ?</Text>
          <Text style={styles.subtitle}>
            Choisissez le type de compte qui vous correspond le mieux.
          </Text>

          <View style={styles.grid}>
            <TouchableOpacity
              onPress={() => setProfileType('particulier')}
              activeOpacity={0.7}
              style={[
                styles.typeCard,
                profileType === 'particulier' ? styles.selectedCard : styles.unselectedCard,
              ]}>
              <View
                style={[
                  styles.iconWrapper,
                  profileType === 'particulier' && styles.selectedIconWrapper,
                ]}>
                <User
                  size={32}
                  color={
                    profileType === 'particulier' ? colors.primary.main : colors.text.secondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.typeTitle,
                  profileType === 'particulier' ? styles.selectedText : styles.unselectedText,
                ]}>
                Particulier
              </Text>
              <Text style={styles.typeDesc}>Utilisation personnelle et créative</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setProfileType('entreprise')}
              activeOpacity={0.7}
              style={[
                styles.typeCard,
                profileType === 'entreprise' ? styles.selectedCard : styles.unselectedCard,
              ]}>
              <View
                style={[
                  styles.iconWrapper,
                  profileType === 'entreprise' && styles.selectedIconWrapper,
                ]}>
                <Building2
                  size={32}
                  color={profileType === 'entreprise' ? colors.primary.main : colors.text.secondary}
                />
              </View>
              <Text
                style={[
                  styles.typeTitle,
                  profileType === 'entreprise' ? styles.selectedText : styles.unselectedText,
                ]}>
                Entreprise
              </Text>
              <Text style={styles.typeDesc}>Pour les pros et les organisations</Text>
            </TouchableOpacity>
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
            disabled={!profileType || isLoading}
            loading={isLoading}
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
    gap: 16,
  },
  typeCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  unselectedCard: {
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
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedIconWrapper: {
    backgroundColor: 'rgba(32, 60, 142, 0.15)',
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.text.primary,
  },
  unselectedText: {
    color: colors.text.secondary,
  },
  buttonContainer: {
    marginBottom: 60,
  },
  button: {
    width: '100%',
  },
});
