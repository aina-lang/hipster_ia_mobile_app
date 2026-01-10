import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { Palette, Code, Megaphone, Lightbulb, User } from 'lucide-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';

const PREFERENCES = [
  { id: '1', label: 'Créatif (Design, Art)', icon: Palette },
  { id: '2', label: 'Technologie (Dev, Data)', icon: Code },
  { id: '3', label: 'Marketing & Ventes', icon: Megaphone },
  { id: '4', label: 'Entrepreneuriat', icon: Lightbulb },
  { id: '5', label: 'Autre', icon: User },
];

export default function PreferencesScreen() {
  const [selectedPref, setSelectedPref] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedPref) {
      router.push('/(onboarding)/ready');
    }
  };

  return (
    <BackgroundGradient>
      <StepIndicator currentStep={4} totalSteps={5} />

      <View style={styles.container}>
        <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
          <Text style={styles.title}>Quel est votre domaine ?</Text>
          <Text style={styles.subtitle}>
            Sélectionnez votre activité principale pour adapter Hipster IA.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {PREFERENCES.map((pref) => {
              const Icon = pref.icon;
              const isSelected = selectedPref === pref.id;

              return (
                <TouchableOpacity
                  key={pref.id}
                  onPress={() => setSelectedPref(pref.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.prefCard,
                    isSelected ? styles.selectedCard : styles.unselectedCard,
                  ]}>
                  <View style={[styles.iconWrapper, isSelected && styles.selectedIconWrapper]}>
                    <Icon
                      size={20}
                      color={isSelected ? colors.primary.main : colors.text.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.prefText,
                      isSelected ? styles.selectedText : styles.unselectedText,
                    ]}>
                    {pref.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.buttonContainer}>
          <NeonButton
            title="Continuer"
            onPress={handleNext}
            size="lg"
            variant="premium"
            disabled={!selectedPref}
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
    marginBottom: 32,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  prefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  unselectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedCard: {
    backgroundColor: 'rgba(32, 60, 142, 0.1)',
    borderColor: colors.primary.main,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconWrapper: {
    backgroundColor: 'rgba(32, 60, 142, 0.15)',
  },
  prefText: {
    fontSize: 16,
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
