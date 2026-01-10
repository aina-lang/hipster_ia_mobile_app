import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useUserStore } from '../../store/useUserStore';

export default function NameScreen() {
  const [name, setName] = useState('');
  const { updateProfile, isUpdating } = useUserStore();

  const handleNext = async () => {
    if (name.trim()) {
      try {
        await updateProfile({ firstName: name.trim() });
        router.push('/(onboarding)/age');
      } catch (error: any) {
        Alert.alert('Erreur', 'Échec de la mise à jour du profil. Veuillez réessayer.');
      }
    }
  };

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={2} totalSteps={5} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
          <Text style={styles.title}>Comment souhaitez-vous que je vous appelle ?</Text>
          <Text style={styles.subtitle}>C'est plus sympa pour discuter ensuite.</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom"
              placeholderTextColor={colors.text.muted}
              value={name}
              onChangeText={setName}
              autoFocus
              selectionColor={colors.primary.main}
            />
            <View style={styles.inputBorder} />
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
            disabled={!name.trim()}
            loading={isUpdating}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
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
  inputWrapper: {
    width: '100%',
  },
  input: {
    fontSize: 24,
    color: colors.text.primary,
    paddingVertical: 12,
    fontWeight: '500',
  },
  inputBorder: {
    height: 2,
    backgroundColor: colors.primary.main,
    width: '100%',
    borderRadius: 1,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContainer: {
    marginBottom: 60,
  },
  button: {
    width: '100%',
  },
});
