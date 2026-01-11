import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore } from '../../store/creationStore';
import { Check, Copy, Share, Home } from 'lucide-react-native';
import { AiService } from '../../api/ai.service';

export default function Step5ResultScreen() {
  const router = useRouter();
  const { userQuery, selectedJob, selectedType, selectedContext, reset } = useCreationStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const generateContent = async () => {
      try {
        setLoading(true);
        let resultData: any;

        const prompt = `Je suis un ${selectedJob}. Contexte: ${selectedContext || 'Aucun'}. Demande: ${userQuery}`;

        if (selectedType === 'Texte') {
          // Default logic: use 'social' unless it looks like an ad
          const type =
            selectedContext === 'Soldes' || userQuery.toLowerCase().includes('promo')
              ? 'ad'
              : 'social';
          resultData = await AiService.generateText(prompt, type);
          setResult(resultData.content);
        } else if (selectedType === 'Image') {
          resultData = await AiService.generateImage(prompt, 'realistic'); // Default style
          setResult(resultData.url); // Assuming it returns { url: ... }
        } else if (selectedType === 'Document') {
          resultData = await AiService.generateDocument('business', {
            job: selectedJob,
            context: selectedContext,
            details: userQuery,
          });
          setResult(resultData.content);
        } else {
          // Fallback or error
          setResult('Type de création non supporté.');
        }
      } catch (error) {
        console.error('Generation error:', error);
        setResult('Une erreur est survenue lors de la génération. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    generateContent();
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
            {selectedType === 'Image' && result ? (
              <Image source={{ uri: result }} style={styles.generatedImage} resizeMode="cover" />
            ) : (
              <Text style={styles.resultText}>{result}</Text>
            )}

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
    paddingTop: 200,
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
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
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
