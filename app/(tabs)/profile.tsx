import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { colors } from '../../theme/colors';

export default function ProfileScreen() {
  return (
    <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={80}>
      <View style={styles.container}>
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.subtitle}>Gérez vos paramètres et votre compte.</Text>
      </View>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
