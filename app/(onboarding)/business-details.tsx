import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export default function BusinessDetailsScreen() {
  const [companyName, setCompanyName] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const { updateAiProfile, isLoading, user } = useAuthStore();

  const handleNext = async () => {
    if (companyName) {
      try {
        await updateAiProfile({
          companyName,
          professionalEmail: professionalEmail || user?.email,
        });
        router.push('/(onboarding)/ready');
      } catch (error) {
        console.error('Failed to update business details:', error);
      }
    }
  };

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={2} totalSteps={3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
            <Text style={styles.title}>Détails de l'entreprise</Text>
            <Text style={styles.subtitle}>
              Ces informations nous aident à personnaliser votre expérience professionnelle.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom de l'entreprise</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Hipster Digital"
                  placeholderTextColor={colors.text.muted}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email professionnel (Optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="pro@entreprise.com"
                  placeholderTextColor={colors.text.muted}
                  value={professionalEmail}
                  onChangeText={setProfessionalEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.buttonContainer}>
          <NeonButton
            title="Continuer"
            onPress={handleNext}
            size="lg"
            variant="premium"
            disabled={!companyName || isLoading}
            loading={isLoading}
            style={styles.button}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
  },
  content: {
    flex: 1,
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
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContainer: {
    marginBottom: 60,
  },
  button: {
    width: '100%',
  },
});
