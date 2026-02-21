import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from './../../theme/colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Étape {currentStep} sur {totalSteps}
      </Text>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index + 1 === currentStep ? styles.activeDot : styles.inactiveDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  text: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 28,
    height: 8,
    borderRadius: 100,
  },
  inactiveDot: {
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
  },
});
