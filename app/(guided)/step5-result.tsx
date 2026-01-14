import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Share,
  Home,
  Check,
  Copy,
  Download,
  FileText,
  RefreshCcw,
  Sparkles,
  Image as LucideImage,
  ChevronDown,
  X,
  Paperclip,
  Mic,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { AiService, TextGenerationType } from '../../api/ai.service';
import { WORKFLOWS } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const { width } = Dimensions.get('window');

const MODEL_IMAGES: Record<string, string> = {
  Moderne:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  Minimaliste:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
  Luxe: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=400&auto=format&fit=crop',
  Coloré:
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
};

export default function Step5ResultScreen() {
  const router = useRouter();
  const {
    userQuery,
    selectedJob,
    selectedFunction,
    selectedCategory,
    selectedContext,
    selectedTone,
    selectedTarget,
    workflowAnswers,
    reset,
  } = useCreationStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [localQuery, setLocalQuery] = useState(userQuery);
  const [selectedModel, setSelectedModel] = useState('Moderne');
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Animation for skeleton text
  const [pulseAnim] = useState(new Animated.Value(0.3));

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['photo'],
  });

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [loading, pulseAnim]);

  useEffect(() => {
    setLocalQuery(userQuery);
  }, [userQuery]);

  const getParsedData = (rawResult: string | null) => {
    if (!rawResult) return null;
    try {
      let jsonStr = rawResult.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }

      if (jsonStr.startsWith('{')) {
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.log('Parsing failed', e);
    }
    return null;
  };

  const getVisibleText = (rawResult: string | null) => {
    if (!rawResult) return '';
    const data = getParsedData(rawResult);
    if (!data) return rawResult;

    let text = '';
    if (data.title) text += `${data.title}\n\n`;
    if (data.presentation) text += `${data.presentation}\n\n`;

    if (data.sections && Array.isArray(data.sections)) {
      data.sections.forEach((s: any) => {
        if (s.title) text += `--- ${s.title.toUpperCase()} ---\n`;
        if (s.content) text += `${s.content}\n`;
        if (s.table && Array.isArray(s.table)) {
          s.table.forEach((row: any[]) => {
            text += row.join(' | ') + '\n';
          });
        }
        text += '\n';
      });
    }

    if (data.conclusion) text += `${data.conclusion}`;
    return text.trim();
  };

  const generateContent = async (overrideQuery?: string) => {
    try {
      setLoading(true);
      setResult(null);
      setImageUrl(null);
      setShowRegeneratePanel(false);
      let resultData: any;

      const authUser = useAuthStore.getState().user;
      const profile = authUser?.aiProfile;

      const questionList =
        (selectedJob && selectedFunction && WORKFLOWS[selectedJob]?.[selectedFunction]) || [];
      const workflowDetails = questionList
        .map((q) => {
          const answer = workflowAnswers[q.id];
          return answer ? `${q.label}: ${answer}` : null;
        })
        .filter(Boolean)
        .join('\n');

      const contextPart = selectedContext ? `Contexte: ${selectedContext}` : '';
      const tonePart = selectedTone ? `Ton: ${selectedTone}` : '';
      const targetPart = selectedTarget ? `Cible: ${selectedTarget}` : '';
      const jobPart = `Métier: ${selectedJob || 'Non spécifié'}`;
      const cleanFunction = (selectedFunction || 'Création de contenu')
        .replace(/\s*\(.*?\)\s*/g, '')
        .trim();

      const promptContext = [
        jobPart,
        `Tâche: ${cleanFunction}`,
        workflowDetails,
        contextPart,
        tonePart,
        targetPart,
      ]
        .filter(Boolean)
        .join('\n');

      const queryToUse = overrideQuery || userQuery;
      const fullPrompt = `${promptContext}\n\nInstructions: Génère le contenu demandé. Sois direct, créatif et professionnel.\n\nDemande utilisateur : ${queryToUse}`;

      const isCoiffeurInsta =
        selectedJob === 'Coiffeur' && selectedFunction === 'Post Instagram (Image + Texte)';

      if (isCoiffeurInsta) {
        const styleAnswer = workflowAnswers['style'] || 'modern';
        const imagePrompt = `${fullPrompt} (Style: ${styleAnswer}, Photorealistic, high quality)`;
        const textOnlyPrompt = `${fullPrompt}\n\nIMPORTANT: Génère UNIQUEMENT le texte de la légende (caption) pour le post Instagram. N'inclus PAS de suggestion d'image, ni de titres comme '### Text' ou '### Caption'. Commencez directment par le contenu.`;

        const [textResponse, imageResponse] = await Promise.all([
          AiService.generateText(textOnlyPrompt, 'social'),
          AiService.generateImage(imagePrompt, 'realistic'),
        ]);

        let cleanedText = textResponse.content
          .replace(/###\s*(image suggestion|text|caption|description)/gi, '')
          .replace(/\*\*Image suggestion\*\*:?.*$/gim, '')
          .trim();

        setResult(cleanedText);
        setImageUrl(imageResponse.url);
        setGenerationId(textResponse.generationId);
      } else if (selectedCategory === 'Image') {
        const styleAnswer = workflowAnswers['style'] || 'realistic';
        const imagePrompt = `${fullPrompt} (Style: ${styleAnswer})`;
        resultData = await AiService.generateImage(imagePrompt, 'realistic');
        setResult(resultData.url);
        setGenerationId(resultData.generationId);
      } else if (selectedCategory === 'Document') {
        const userProfile = useAuthStore.getState().user?.aiProfile;
        resultData = await AiService.generateDocument('business', {
          job: selectedJob,
          function: selectedFunction,
          context: selectedContext,
          details: fullPrompt,
          userProfile,
          workflowAnswers,
        });
        setResult(resultData.content);
        setGenerationId(resultData.generationId);
      } else {
        const subType: TextGenerationType = selectedCategory === 'Social' ? 'social' : 'blog';
        resultData = await AiService.generateText(fullPrompt, subType);
        setResult(resultData.content);
        setGenerationId(resultData.generationId);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setResult('Une erreur est survenue lors de la génération. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateContent();
  }, []);

  const handleDownload = async (format: string) => {
    if (!generationId) {
      showModal('error', 'Erreur', "Impossible d'exporter : ID manquant");
      return;
    }

    try {
      showModal(
        'loading',
        'Téléchargement en cours...',
        'Veuillez patienter pendant la création du fichier.'
      );

      const apiBaseUrl = 'https://hipster-api.fr/api';
      const downloadUrl = `${apiBaseUrl}/ai/export/${generationId}?format=${format}&model=${selectedModel}`;
      const extension = format === 'excel' ? 'xlsx' : format === 'image' ? 'png' : format;
      const fileName = `Hipster_${generationId}_${Date.now()}.${extension}`;
      const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`;

      const token = await AsyncStorage.getItem('access_token');

      const downloadRes = await (FileSystem as any).downloadAsync(downloadUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setModalVisible(false);

      if (downloadRes.status === 200) {
        // Cas spécifique pour les images : Enregistrer dans la galerie
        if (format === 'image' || format === 'png') {
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
              await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
              showModal('success', 'Enregistré !', "L'image a été ajoutée à votre galerie");
              return;
            }
          } catch (e) {
            console.error('MediaLibrary error:', e);
          }
        }

        // Pour les autres fichiers ou si MediaLibrary échoue
        if (Platform.OS === 'android') {
          try {
            const contentUri = await (FileSystem as any).getContentUriAsync(downloadRes.uri);
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: contentUri,
              flags: 1,
              type:
                format === 'pdf'
                  ? 'application/pdf'
                  : format === 'excel' || format === 'xlsx'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : format === 'docx'
                      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      : 'application/octet-stream',
            });
          } catch (e) {
            await Sharing.shareAsync(downloadRes.uri, {
              dialogTitle: 'Enregistrer le document',
            });
          }
        } else {
          await Sharing.shareAsync(downloadRes.uri, {
            UTI:
              format === 'pdf'
                ? 'com.adobe.pdf'
                : format === 'docx'
                  ? 'org.openxmlformats.wordprocessingml.document'
                  : format === 'excel' || format === 'xlsx'
                    ? 'org.openxmlformats.spreadsheetml.sheet'
                    : undefined,
          });
        }
      } else {
        showModal('error', 'Erreur', 'Le téléchargement a échoué.');
      }
    } catch (error) {
      console.error('Download error:', error);
      setModalVisible(false);
      showModal('error', 'Erreur', 'Une erreur est survenue.');
    }
  };

  const handleCopyText = async () => {
    if (!result) return;
    const cleanText = getVisibleText(result);
    await Clipboard.setStringAsync(cleanText);
    showModal('success', 'Copié !', 'Le texte a été copié dans votre presse-papier');
  };

  const handleSaveToGallery = async () => {
    if (!imageUrl) return;

    try {
      if (permissionResponse?.status !== 'granted') {
        const permission = await requestPermission();
        if (!permission.granted) {
          showModal(
            'error',
            'Permission refusée',
            "Nous avons besoin de votre permission pour enregistrer l'image."
          );
          return;
        }
      }

      showModal('loading', 'Enregistrement...', 'Sauvegarde dans votre galerie.');

      const filename = `Hipster-${Date.now()}.png`;
      const fileUri = `${(FileSystem as any).cacheDirectory}${filename}`;

      const downloadRes = await (FileSystem as any).downloadAsync(imageUrl, fileUri);

      if (downloadRes.status !== 200) {
        throw new Error('Download failed');
      }

      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);

      const album = await MediaLibrary.getAlbumAsync('Hipster');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Hipster', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      setModalVisible(false);
      showModal('success', 'Enregistré !', "L'image a été ajoutée à votre galerie");
    } catch (error) {
      console.error('Save to gallery error:', error);
      setModalVisible(false);
      showModal('error', 'Erreur', "Impossible d'enregistrer l'image.");
    }
  };

  const handleShare = async () => {
    try {
      if (imageUrl) {
        showModal('loading', 'Préparation', "Téléchargement de l'image...");

        const filename = `share-${Date.now()}.png`;
        const fileUri = `${(FileSystem as any).cacheDirectory}${filename}`;

        const res = await (FileSystem as any).downloadAsync(imageUrl, fileUri);

        setModalVisible(false);
        if (res.status === 200) {
          await Sharing.shareAsync(res.uri);
        } else {
          showModal('error', 'Oups', 'Echec du téléchargement pour le partage.');
        }
      } else if (result && selectedCategory !== 'Image') {
        handleCopyText();
      }
    } catch (error) {
      setModalVisible(false);
      console.error('Share error:', error);
      showModal('error', 'Erreur', 'Impossible de partager.');
    }
  };

  const handleFinish = () => {
    reset();
    router.replace('/(drawer)');
  };

  return (
    <GuidedScreenWrapper
      headerRight={
        <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
          <Home size={18} color={colors.primary.main} />
          <Text style={styles.finishButtonText}>Terminer</Text>
        </TouchableOpacity>
      }>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header simplifié */}
          <View style={styles.header}>
            {loading ? (
              <View style={styles.loadingHeader}>
                <DeerAnimation size={60} progress={50} />
                <Text style={styles.loadingTitle}>Création en cours...</Text>
                <Text style={styles.loadingSubtitle}>Hipster•IA travaille pour vous</Text>
              </View>
            ) : (
              <>
                <View style={styles.successIcon}>
                  <Check size={32} color={colors.background.dark} />
                </View>
                <Text style={styles.title}>Votre contenu est prêt !</Text>
              </>
            )}
          </View>

          {/* Carte de résultat simplifiée */}
          <View style={styles.resultCard}>
            {/* Image si présente */}
            {(selectedCategory === 'Image' || imageUrl) && (
              <View style={styles.imageSection}>
                {loading ? (
                  <View style={styles.imagePlaceholder}>
                    <LucideImage size={48} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.placeholderText}>Génération de l'image...</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: imageUrl || result || '' }}
                    style={styles.generatedImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            )}

            {/* Document */}
            {selectedCategory === 'Document' && !loading && (
              <View style={styles.documentSection}>
                <View style={styles.documentHeader}>
                  <FileText size={32} color={colors.primary.main} />
                  <Text style={styles.documentTitle}>Document prêt</Text>
                </View>

                {/* Model Picker intégré */}
                <TouchableOpacity
                  style={styles.modelSelector}
                  onPress={() => setShowModelPicker(!showModelPicker)}>
                  <Text style={styles.modelSelectorLabel}>Design :</Text>
                  <View style={styles.modelSelectorValue}>
                    <Text style={styles.modelSelectorText}>{selectedModel}</Text>
                    <ChevronDown
                      size={20}
                      color={colors.text.secondary}
                      style={{
                        transform: [{ rotate: showModelPicker ? '180deg' : '0deg' }],
                      }}
                    />
                  </View>
                </TouchableOpacity>

                {showModelPicker && (
                  <View style={styles.modelOptions}>
                    {['Moderne', 'Minimaliste', 'Luxe', 'Coloré'].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.modelOption,
                          selectedModel === opt && styles.modelOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedModel(opt);
                          setShowModelPicker(false);
                        }}>
                        <Image
                          source={{ uri: MODEL_IMAGES[opt] }}
                          style={styles.modelOptionImage}
                        />
                        <Text
                          style={[
                            styles.modelOptionText,
                            selectedModel === opt && styles.modelOptionTextSelected,
                          ]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Boutons d'export simplifiés */}
                {/* <View style={styles.exportButtons}>
                  <TouchableOpacity
                    style={[styles.exportButton, styles.exportButtonPrimary]}
                    onPress={() => handleDownload('pdf')}>
                    <Download size={18} color="#000" />
                    <Text style={styles.exportButtonTextPrimary}>PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleDownload('docx')}>
                    <Download size={18} color={colors.text.secondary} />
                    <Text style={styles.exportButtonText}>Word</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleDownload('excel')}>
                    <Download size={18} color={colors.text.secondary} />
                    <Text style={styles.exportButtonText}>Excel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleDownload('image')}>
                    <LucideImage size={18} color={colors.text.secondary} />
                    <Text style={styles.exportButtonText}>Image</Text>
                  </TouchableOpacity>
                </View> */}
              </View>
            )}

            {/* Texte (Toujours visible si présent pour permettre l'export même si pas en mode Document) */}
            {(selectedCategory !== 'Document' || loading || result) &&
              selectedCategory !== 'Image' && (
                <View style={styles.textSection}>
                  {!loading && (
                    <View style={styles.exportButtons}>
                      <TouchableOpacity
                        style={[styles.exportButton, styles.exportButtonPrimary]}
                        onPress={() => handleDownload('pdf')}>
                        <Download size={18} color="#fff" />
                        <Text style={styles.exportButtonTextPrimary}>PDF</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exportButton}
                        onPress={() => handleDownload('image')}>
                        <LucideImage size={18} color={colors.text.secondary} />
                        <Text style={styles.exportButtonText}>Image</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {loading ? (
                    <View style={styles.textPlaceholder}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.skeletonLine,
                            { width: i === 5 ? '70%' : '100%', opacity: pulseAnim },
                          ]}
                        />
                      ))}
                    </View>
                  ) : (
                    (() => {
                      const data = getParsedData(result);
                      if (data) {
                        return (
                          <View style={styles.structuredContent}>
                            {data.presentation && (
                              <Text style={styles.contentText}>{data.presentation}</Text>
                            )}
                            {data.sections?.map((section: any, idx: number) => (
                              <View key={idx} style={styles.contentSection}>
                                {section.title && (
                                  <Text style={styles.sectionTitle}>{section.title}</Text>
                                )}
                                {section.content && (
                                  <Text style={styles.contentText}>{section.content}</Text>
                                )}
                              </View>
                            ))}
                            {data.conclusion && (
                              <Text style={styles.conclusionText}>{data.conclusion}</Text>
                            )}
                          </View>
                        );
                      }
                      return <Text style={styles.contentText}>{result}</Text>;
                    })()
                  )}
                </View>
              )}

            {/* Actions bar simplifiée */}
            {!loading && (
              <View style={styles.actionsBar}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCopyText}>
                  <Copy size={20} color={colors.primary.main} />
                  <Text style={styles.actionButtonText}>Copier</Text>
                </TouchableOpacity>

                {(selectedCategory === 'Image' || imageUrl) && (
                  <>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.actionButton} onPress={handleSaveToGallery}>
                      <Download size={20} color={colors.primary.main} />
                      <Text style={styles.actionButtonText}>Sauvegarder</Text>
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                  <Share size={20} color={colors.primary.main} />
                  <Text style={styles.actionButtonText}>Partager</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Panneau de régénération replié */}
          {!loading && (
            <View style={styles.regenerateContainer}>
              {!showRegeneratePanel ? (
                <TouchableOpacity
                  style={styles.regenerateToggle}
                  onPress={() => setShowRegeneratePanel(true)}>
                  <RefreshCcw size={20} color={colors.primary.main} />
                  <Text style={styles.regenerateToggleText}>Modifier et régénérer</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.regeneratePanel}>
                  <View style={styles.regeneratePanelHeader}>
                    <Text style={styles.regeneratePanelTitle}>Affinez votre demande</Text>
                    <TouchableOpacity onPress={() => setShowRegeneratePanel(false)}>
                      <X size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.regenerateInput}
                    value={localQuery}
                    onChangeText={setLocalQuery}
                    placeholder="Ex: Ajoute plus de détails sur..."
                    placeholderTextColor={colors.text.muted}
                    multiline
                    maxLength={500}
                  />

                  <View style={styles.regenerateTools}>
                    <TouchableOpacity style={styles.toolIcon}>
                      <LucideImage size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolIcon}>
                      <Paperclip size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolIcon}>
                      <Mic size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <View style={styles.charCounter}>
                      <Text style={styles.charCounterText}>{localQuery.length}/500</Text>
                    </View>
                  </View>

                  <NeonButton
                    title="Régénérer"
                    onPress={() => generateContent(localQuery)}
                    icon={<Sparkles size={20} color="#000" />}
                    size="lg"
                    variant="premium"
                  />
                </View>
              )}
            </View>
          )}

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  finishButtonText: {
    color: colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  loadingHeader: {
    alignItems: 'center',
    gap: 12,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageSection: {
    width: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  generatedImage: {
    width: '100%',
    aspectRatio: 1,
  },
  documentSection: {
    padding: 24,
  },
  documentHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  modelSelectorLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modelSelectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelSelectorText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modelOptions: {
    gap: 12,
    marginBottom: 24,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelOptionSelected: {
    borderColor: colors.primary.main,
    backgroundColor: 'rgba(0, 255, 170, 0.05)',
  },
  modelOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  modelOptionText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  modelOptionTextSelected: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exportButtonPrimary: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  exportButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  textSection: {
    padding: 24,
  },
  textPlaceholder: {
    gap: 12,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 7,
  },
  structuredContent: {
    gap: 20,
    marginTop:10,
  },
  contentSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 4,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.primary,
  },
  conclusionText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  regenerateContainer: {
    marginTop: 24,
  },
  regenerateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.2)',
  },
  regenerateToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary.main,
  },
  regeneratePanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  regeneratePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  regeneratePanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  regenerateInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 16,
    color: colors.text.primary,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  charCounter: {
    alignItems: 'flex-end',
  },
  charCounterText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  regenerateTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  toolIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
});
