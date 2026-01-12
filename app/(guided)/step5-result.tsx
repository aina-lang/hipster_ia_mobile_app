import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy'; // Fallback for getContentUriAsync if needed
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { useCreationStore } from '../../store/creationStore';
import { Share, Home, Check, Copy, Download, FileText } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { AiService, TextGenerationType } from '../../api/ai.service';
import { encodeToon, containsToon, extractToonBlocks } from '../../utils/toon';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function Step5ResultScreen() {
  const router = useRouter();
  const { userQuery, selectedJob, selectedFunction, selectedCategory, selectedContext, reset } =
    useCreationStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  // Generic Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

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
          // Pass user profile for professional documents (Invoice/Quote)
          const userProfile = useAuthStore.getState().user?.aiProfile;

          resultData = await AiService.generateDocument('business', {
            job: selectedJob,
            function: selectedFunction,
            context: selectedContext,
            details: userQuery,
            userProfile, // Add profile data
          });
          console.log('Backend Response (Document):', JSON.stringify(resultData, null, 2));
          setResult(resultData.content);
          setGenerationId(resultData.generationId);
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

  const handleDownload = async (format: string) => {
    if (!generationId) return;

    try {
      // 1. Show Feedback (Modal + Notification)
      showModal(
        'loading',
        'Téléchargement en cours...',
        'Veuillez patienter pendant la récupération du fichier.'
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Téléchargement en cours',
          body: `Votre document ${format.toUpperCase()} est en cours de téléchargement...`,
        },
        trigger: null,
      });

      const apiBaseUrl = 'https://hipster-api.fr/api';
      const downloadUrl = `${apiBaseUrl}/ai/export/${generationId}?format=${format}`;
      const fileName = `document_${generationId}_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      const destination = new File(Paths.document, fileName);

      // Check access token
      const token = await AsyncStorage.getItem('access_token');

      // 2. Perform Download
      const downloadRes = await File.downloadFileAsync(downloadUrl, destination, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Dismiss loading modal
      setModalVisible(false);

      if (downloadRes.exists) {
        // Success Notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Téléchargement terminé',
            body: 'Votre document est prêt.',
          },
          trigger: null,
        });

        // 3. Open File Directly
        if (Platform.OS === 'android') {
          try {
            // Get Content URI for Android Intent
            const contentUri = await FileSystemLegacy.getContentUriAsync(destination.uri);

            // Determine MIME type based on format
            let mimeType = 'application/octet-stream';
            if (format === 'pdf') mimeType = 'application/pdf';
            else if (format === 'docx')
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else if (format === 'excel' || format === 'xlsx')
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: contentUri,
              flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
              type: mimeType,
            });
          } catch (e) {
            console.warn('Android Intent failed, falling back to Share', e);
            await Sharing.shareAsync(destination.uri);
          }
        } else {
          // iOS: Use Sharing for preview
          await Sharing.shareAsync(destination.uri);
        }
      } else {
        showModal('error', 'Erreur', 'Impossible de télécharger le fichier.');
      }
    } catch (error) {
      console.error('Download error:', error);
      setModalVisible(false);
      showModal('error', 'Erreur', 'Une erreur est survenue lors du téléchargement.');
    }
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
                <Text style={styles.documentSubtitle}>Document prêt à l'emploi</Text>

                <View style={styles.downloadOptions}>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload('pdf')}>
                    <Download size={20} color="#000" />
                    <Text style={styles.downloadButtonText}>PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.downloadButton, { backgroundColor: '#2b579a' }]}
                    onPress={() => handleDownload('docx')}>
                    <Download size={20} color="#fff" />
                    <Text style={[styles.downloadButtonText, { color: '#fff' }]}>Word</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.downloadButton, { backgroundColor: '#217346' }]}
                    onPress={() => handleDownload('excel')}>
                    <Download size={20} color="#fff" />
                    <Text style={[styles.downloadButtonText, { color: '#fff' }]}>Excel</Text>
                  </TouchableOpacity>
                </View>
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
      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
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
  downloadOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  downloadButton: {
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#000',
    fontSize: 14,
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
