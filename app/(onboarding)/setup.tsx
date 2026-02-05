import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { Scissors, UtensilsCrossed, Store, Hammer, MapPin, Briefcase, Leaf, Plus } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

const JOBS = [
  { label: 'Coiffure & Esthétique', icon: Scissors },
  { label: 'Restaurant / Bar', icon: UtensilsCrossed },
  { label: 'Commerce / Boutique', icon: Store },
  { label: 'Artisans du bâtiment', icon: Hammer },
  { label: 'Service local', icon: MapPin },
  { label: 'Profession libérale', icon: Briefcase },
  { label: 'Bien-être / Santé alternative', icon: Leaf },
  { label: 'Autre', icon: Plus },
];

export default function SetupScreen() {
  const router = useRouter();
  const {
    lastName, setProfileData,
    job, setJob
  } = useOnboardingStore();

  const [localLastName, setLocalLastName] = useState(lastName);
  const [localJob, setLocalJob] = useState(job);
  const [localOtherJob, setLocalOtherJob] = useState('');

  const handleNext = () => {
    if (localLastName && localJob) {
      setProfileData({
        lastName: localLastName,
      });
      setJob(localJob === 'Autre' ? localOtherJob : localJob);
      router.push('/(onboarding)/branding');
    }
  };

  const isValid = localLastName?.length > 0 &&
    (localJob === 'Autre' ? localOtherJob.length > 0 : !!localJob);

  return (
    <BackgroundGradientOnboarding blurIntensity={90}>
      <StepIndicator currentStep={1} totalSteps={3} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
            <Text style={styles.title}>Qui êtes-vous ?</Text>
            <Text style={styles.subtitle}>
              Commençons par les présentations.
            </Text>

            <View style={styles.inputsContainer}>
              <View style={styles.fullInputWrapper}>
                <Text style={styles.label}>Votre Nom / Entreprise</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Hipster Records ou Mylène Farmer"
                  placeholderTextColor={colors.text.muted}
                  value={localLastName}
                  onChangeText={setLocalLastName}
                />
              </View>

              <View style={[styles.inputsContainer, { marginTop: 10 }]}>
                <Text style={styles.label}>Quel est votre métier ?</Text>

                <View style={styles.gridItems}>
                  {JOBS.map((j) => (
                    <View key={j.label} style={styles.gridItem}>
                      <SelectionCard
                        label={j.label}
                        icon={j.icon}
                        selected={localJob === j.label}
                        onPress={() => setLocalJob(j.label)}
                      />
                    </View>
                  ))}
                </View>

                {localJob === 'Autre' && (
                  <Animated.View entering={FadeInDown.duration(400)} style={styles.fullInputWrapper}>
                    <Text style={styles.label}>Précisez votre métier</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Photographe, Coach..."
                      placeholderTextColor={colors.text.muted}
                      value={localOtherJob}
                      onChangeText={setLocalOtherJob}
                      autoFocus
                    />
                  </Animated.View>
                )}
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
          <NeonButton
            title="Continuer"
            onPress={handleNext}
            size="lg"
            variant="premium"
            disabled={!isValid}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120
  },
  content: {
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 30,
  },
  inputsContainer: {
    gap: 16
  },
  fullInputWrapper: {
    gap: 8
  },
  label: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500'
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    fontSize: 16
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  button: {
    width: '100%',
  },
  gridItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
});
