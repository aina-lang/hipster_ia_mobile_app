import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { User, Building2, Scissors, UtensilsCrossed, Store, Palette, Hammer, MapPin } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

const { width } = Dimensions.get('window');

const JOBS = [
  { label: 'Coiffeur', icon: Scissors },
  { label: 'Restaurant', icon: UtensilsCrossed },
  { label: 'Boutique', icon: Store },
  { label: 'Créateur', icon: Palette },
  { label: 'Artisan', icon: Hammer },
  { label: 'Service local', icon: MapPin },
];

export default function SetupScreen() {
  const router = useRouter();
  const {
    profileType, setProfileData,
    firstName, lastName, companyName,
    job, setJob
  } = useOnboardingStore();

  // Local state for inputs to allow smooth typing, sync on Next or blur
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [localJob, setLocalJob] = useState(job);
  const [localType, setLocalType] = useState<'particulier' | 'entreprise' | null>(profileType);

  const handleNext = () => {
    if (localType && localLastName && localJob) {
      if (localType === 'entreprise' && !localCompanyName) return; // Validation

      setProfileData({
        profileType: localType,
        firstName: localFirstName || '',
        lastName: localLastName,
        companyName: localType === 'entreprise' ? localCompanyName : undefined
      });
      setJob(localJob);
      router.push('/(onboarding)/branding');
    }
  };

  const isValid = localType && localLastName?.length > 0 && localJob && (localType !== 'entreprise' || localCompanyName?.length > 0);

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

            {/* Profile Type Grid */}
            <View style={styles.grid}>
              <TouchableOpacity
                onPress={() => setLocalType('particulier')}
                activeOpacity={0.7}
                style={[
                  styles.typeCard,
                  localType === 'particulier' ? styles.selectedCard : styles.unselectedCard,
                ]}>
                <View style={[styles.iconWrapper, localType === 'particulier' && styles.selectedIconWrapper]}>
                  <User size={24} color={localType === 'particulier' ? colors.primary.main : colors.text.secondary} />
                </View>
                <Text style={[styles.typeTitle, localType === 'particulier' ? styles.selectedText : styles.unselectedText]}>
                  Particulier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setLocalType('entreprise')}
                activeOpacity={0.7}
                style={[
                  styles.typeCard,
                  localType === 'entreprise' ? styles.selectedCard : styles.unselectedCard,
                ]}>
                <View style={[styles.iconWrapper, localType === 'entreprise' && styles.selectedIconWrapper]}>
                  <Building2 size={24} color={localType === 'entreprise' ? colors.primary.main : colors.text.secondary} />
                </View>
                <Text style={[styles.typeTitle, localType === 'entreprise' ? styles.selectedText : styles.unselectedText]}>
                  Entreprise
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.inputsContainer}>
              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Prénom (Optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mylène"
                    placeholderTextColor={colors.text.muted}
                    value={localFirstName}
                    onChangeText={setLocalFirstName}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Farmer"
                    placeholderTextColor={colors.text.muted}
                    value={localLastName}
                    onChangeText={setLocalLastName}
                  />
                </View>
              </View>

              {localType === 'entreprise' && (
                <Animated.View entering={FadeInDown.duration(400)} style={styles.fullInputWrapper}>
                  <Text style={styles.label}>Nom de l'entreprise</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Hipster Records"
                    placeholderTextColor={colors.text.muted}
                    value={localCompanyName}
                    onChangeText={setLocalCompanyName}
                  />
                </Animated.View>
              )}

              {/* Job Selection Section */}
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
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30
  },
  typeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  unselectedCard: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedCard: {
    backgroundColor: 'rgba(15,23,42,1)',
    borderColor: colors.primary.main,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIconWrapper: {
    backgroundColor: 'rgba(32, 60, 142, 0.15)',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.text.primary,
  },
  unselectedText: {
    color: colors.text.secondary,
  },
  inputsContainer: {
    gap: 16
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  inputWrapper: {
    flex: 1,
    gap: 8
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
  animationContainer: {
    alignItems: 'center',
    marginVertical: 10
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
