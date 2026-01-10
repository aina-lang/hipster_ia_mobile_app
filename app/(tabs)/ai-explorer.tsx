import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { colors } from '../../theme/colors';

export default function AiExplorerScreen() {
  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <Text style={styles.title}>IA Explorer</Text>
        <Text style={styles.subtitle}>Bientôt disponible : Découvrez le futur de l'IA.</Text>
      </View>
    </BackgroundGradient>
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
