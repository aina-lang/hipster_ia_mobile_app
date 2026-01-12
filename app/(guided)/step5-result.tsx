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
import { Share, Home, Check, Copy, Download, FileText } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { AiService, TextGenerationType } from '../../api/ai.service';
import { encodeToon, containsToon, extractToonBlocks } from '../../utils/toon';
export default function Step5ResultScreen() {
  const router = useRouter();
  const { userQuery, selectedJob, selectedFunction, selectedCategory, selectedContext, reset } =
    useCreationStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const generateContent = async () => {
      try {
        setLoading(true);
        let resultData: any;

        // Get professional profile info from auth store (via direct access since it's not in creationStore)
        const authUser = useAuthStore.getState().user;
        const profile = authUser?.aiProfile;

        const toonPrompt = encodeToon({
          request: {
            job: selectedJob,
            task: selectedFunction,
            context: selectedContext || 'Standard',
            query: userQuery,
          },
          userProfile:
            profile?.profileType === 'entreprise'
              ? {
                  type: 'entreprise',
                  name: profile.companyName,
                  email: profile.professionalEmail,
                  address: profile.professionalAddress,
                  phone: profile.professionalPhone,
                  bank: profile.bankDetails,
                  web: profile.websiteUrl,
                }
              : { type: 'particulier', name: `${authUser?.firstName} ${authUser?.lastName || ''}` },
          instructions: {
            format: 'Réponds directement avec le contenu généré.',
            optimization:
              'Pour toute liste de données, utilise le format TOON pour économiser des tokens.',
          },
        });

        const prompt = `Génère le contenu suivant structuré en TOON (Token-Oriented Object Notation) pour plus d'efficacité :\n${toonPrompt}`;

        if (selectedCategory === 'Image') {
          resultData = await AiService.generateImage(prompt, 'realistic');
          setResult(resultData.url);
        } else if (selectedCategory === 'Document') {
          resultData = await AiService.generateDocument('business', {
            job: selectedJob,
            function: selectedFunction,
            context: selectedContext,
            details: userQuery,
          });
          setResult(resultData.content);
        } else {
          // Social ou Texte
          const subType: TextGenerationType = selectedCategory === 'Social' ? 'social' : 'blog';
          resultData = await AiService.generateText(prompt, subType);
          setResult(resultData.content);
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

  const ToonRenderer = ({ text }: { text: string }) => {
    const blocks = extractToonBlocks(text);

    if (blocks.length === 0) {
      return <Text style={styles.resultText}>{text}</Text>;
    }

    return (
      <View style={styles.toonContainer}>
        {text.split('\n').map((line, i) => {
          const isToonLine = blocks.some((block) => block.includes(line));
          if (isToonLine && containsToon(line)) {
            return (
              <Text key={i} style={styles.toonHeader}>
                {line}
              </Text>
            );
          }
          if (isToonLine && line.includes(',')) {
            return (
              <View key={i} style={styles.toonRow}>
                {line.split(',').map((val, j) => (
                  <View key={j} style={styles.toonCell}>
                    <Text style={styles.toonCellText}>{val.trim()}</Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <Text key={i} style={styles.resultText}>
              {line}
            </Text>
          );
        })}
      </View>
    );
  };

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
            {selectedCategory === 'Image' ? (
              <>
                <Text style={styles.formatBadge}>VISUEL GÉNÉRÉ (IMAGE)</Text>
                {result ? (
                  <Image
                    source={{ uri: result }}
                    style={styles.generatedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <ActivityIndicator color={colors.primary.main} style={{ marginVertical: 40 }} />
                )}
              </>
            ) : selectedCategory === 'Document' ? (
              <View style={styles.documentCard}>
                <View style={styles.documentIconContainer}>
                  <FileText size={48} color={colors.primary.main} />
                </View>
                <Text style={styles.documentTitle}>{selectedFunction}</Text>
                <Text style={styles.documentSubtitle}>Document (PDF / DOCX) prêt à l'emploi</Text>
                <TouchableOpacity style={styles.downloadButton}>
                  <Download size={20} color="#000" />
                  <Text style={styles.downloadButtonText}>Télécharger le PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.formatBadge}>
                  CONTENU {selectedCategory === 'Social' ? 'SOCIAL' : 'TEXTUEL'}
                </Text>
                {containsToon(result || '') ? (
                  <ToonRenderer text={result || ''} />
                ) : (
                  <Text style={styles.resultText}>{result}</Text>
                )}
              </>
            )}

            <View style={styles.actionsRow}>
              {selectedCategory !== 'Document' && (
                <TouchableOpacity style={styles.iconButton}>
                  <Copy size={20} color={colors.text.secondary} />
                  <Text style={styles.iconButtonText}>Copier</Text>
                </TouchableOpacity>
              )}
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
  formatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    color: colors.primary.main,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
    letterSpacing: 1,
  },
  documentCard: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  documentIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  documentSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
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
  toonContainer: {
    marginVertical: 12,
    gap: 6,
  },
  toonHeader: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toonRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toonCell: {
    flex: 1,
  },
  toonCellText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
