import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { NeonButton } from '../../components/ui/NeonButton';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Utilisateur'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bienvenue sur Hipster IA</Text>
          <Text style={styles.cardText}>
            Prêt à commencer votre voyage avec l'intelligence artificielle ?
          </Text>
        </View>

        <NeonButton
          title="Se déconnecter"
          onPress={logout}
          variant="ghost"
          style={styles.logoutButton}
        />
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary.main,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});
