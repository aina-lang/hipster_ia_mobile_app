import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore } from '../../store/creationStore';
import { Check, Copy, Share, Home } from 'lucide-react-native';

export default function Step5ResultScreen() {
  const router = useRouter();
  const { userQuery, selectedJob, selectedType, selectedContext, reset } = useCreationStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API generation delay
    const timer = setTimeout(() => {
      setLoading(false);
      setResult(
        `[GÉNÉRATION SIMULÉE]\n\n` +
          `Pour : ${selectedJob} - ${selectedType}\n` +
          `Contexte : ${selectedContext || 'Aucun'}\n\n` +
          `Proposition :\n` +
          `Découvrez notre nouvelle collection exclusive ! ✨\n` +
          `Idéale pour la saison, nous avons préparé le meilleur pour vous.\n` +
          `Venez nous voir dès aujourd'hui !`
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
    reset();
    router.replace('/(drawer)');
  };

  if (loading) {
    return (
      <BackgroundGradient>
        <View style={styles.loadingContainer}>
          <DeerAnimation size={200} progress={100} />
          <Text style={styles.loadingText}>Hipster•IA crée votre contenu...</Text>
          <Text style={styles.loadingSubtext}>Analyse du contexte et des tendances.</Text>
        </View>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <Check size={40} color={colors.background.dark} />
            </View>
            <Text style={styles.title}>C'est prêt !</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{result}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconButton}>
                <Copy size={20} color={colors.text.secondary} />
                <Text style={styles.iconButtonText}>Copier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Share size={20} color={colors.text.secondary} />
                <Text style={styles.iconButtonText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.finishContainer}>
            <NeonButton
              title="Terminer"
              onPress={handleFinish}
              icon={<Home size={20} color="#000" />}
              size="lg"
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 32,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  resultText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    justifyContent: 'flex-end',
    gap: 16,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  finishContainer: {
    alignItems: 'center',
  },
});
