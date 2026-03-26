import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  Dimensions,
  ScrollView,
  Share as RNShare,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import {
  Share as ShareIcon,
  Home,
  Check,
  Download,
  FileText,
  Sparkles,
  X,
  ArrowLeft,
} from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { AiService, TextGenerationType } from '../../api/ai.service';
import { VISUAL_ARCHITECTURES } from '../../constants/visualArchitectures';

const { width, height } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Step4ResultScreen() {
  const router = useRouter();

  const {
    userQuery,
    selectedJob,
    selectedFunction,
    selectedCategory,
    selectedStyle,
    uploadedImage,
    colorLeft,
    colorRight,
    mainTitle,
    subTitle,
    infoLine,
    selectedArchitecture,
    reset,
  } = useCreationStore();

  const { user, aiRefreshUser } = useAuthStore();

  const isRestricted = user?.planType === 'curieux';
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const planType = user?.planType || 'curieux';
  const isPackCurieux = planType === 'curieux';
  const promptLimit = user?.promptsLimit || 0;
  const promptUsed = user?.promptsUsed || 0;
  const imagesLimit = user?.imagesLimit || 0;
  const imagesUsed = user?.imagesUsed || 0;

  const [generationId, setGenerationId] = useState<number | null>(null);
  const [seed, setSeed] = useState<number | undefined>();
  const [localQuery, setLocalQuery] = useState('');
  const [regenMode, setRegenMode] = useState<'text' | 'image' | 'both'>('text');

  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

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
    setLocalQuery(userQuery || '');
  }, [userQuery]);

  const getParsedData = (rawResult: string | null) => {
    if (!rawResult || typeof rawResult !== 'string') return null;
    try {
      let jsonStr = rawResult.trim();
      jsonStr = jsonStr
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
        return JSON.parse(jsonStr);
      }
    } catch (e) {
    }
    return null;
  };

  const getVisibleText = (rawResult: string | null): string => {
    if (!rawResult) return '';
    const data = getParsedData(rawResult);
    if (!data) return rawResult;

    let textArr: string[] = [];

    const processValue = (key: string, val: any) => {
      if (key === 'corps_de_texte' || key === 'message_principal') return;
      const label = key.replace(/_/g, ' ').toUpperCase();

      if (typeof val === 'string') {
        textArr.push(`${label}: ${val}`);
      } else if (Array.isArray(val)) {
        textArr.push(`\n[${label}]`);
        val.forEach((item) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([k, v]) => {
              textArr.push(`• ${k.replace(/_/g, ' ')}: ${v}`);
            });
            textArr.push('');
          } else {
            textArr.push(`• ${String(item)}`);
          }
        });
      } else if (typeof val === 'object' && val !== null) {
        textArr.push(`\n[${label}]`);
        Object.entries(val).forEach(([k, v]) => {
          textArr.push(`${k.replace(/_/g, ' ')}: ${v}`);
        });
      }
    };

    const keys = Object.keys(data);
    keys.forEach((key) => processValue(key, data[key]));

    return textArr.join('\n').trim();
  };

  const generateContent = async (
    overrideQuery?: string,
    mode: 'text' | 'image' | 'both' = 'both'
  ) => {
    const state = useCreationStore.getState();
    const {
      selectedCategory,
      selectedFunction,
      selectedJob,
      selectedArchitecture,
      selectedStyle,
      userQuery: storeQuery,
      uploadedImage: storeImage,
      colorLeft: storeColorLeft,
      colorRight: storeColorRight,
      mainTitle: storeMainTitle,
      subTitle: storeSubTitle,
      infoLine: storeInfoLine,
      textPromo: storeTextPromo,
      subject: storeSubject
    } = state;

    let effectiveCategory = selectedCategory;
    let effectiveFunction = selectedFunction;

    if (!effectiveCategory && effectiveFunction) {
      if (effectiveFunction.includes('Flyers')) effectiveCategory = 'Document';
      else if (effectiveFunction.includes('réseaux')) effectiveCategory = 'Social';
      else if (effectiveFunction.includes('Visuel')) effectiveCategory = 'Image';
      else if (effectiveFunction.includes('SEO') || effectiveFunction.includes('Email')) effectiveCategory = 'Texte';
    }

    if (!effectiveCategory) {
      setResult('Erreur : Session expirée ou catégorie non sélectionnée.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setRegenMode(mode);

    try {
      if (mode === 'text' || mode === 'both') setResult('');
      if (mode === 'image' || mode === 'both') setImageUrl('');
      setShowRegeneratePanel(false);

      const isFlyerExact = effectiveFunction && (effectiveFunction.includes('Flyer') || effectiveFunction.includes('Affiche'));
      const params: any = {
        job: selectedJob || 'Autre',
        function: effectiveFunction,
        userQuery: overrideQuery || storeQuery,
        reference_image: storeImage,
      };

      if (isFlyerExact) {
        const arch = VISUAL_ARCHITECTURES.find(a => a.id === selectedArchitecture);
        params.model = arch ? arch.label : selectedStyle;
        params.colorPrincipale = storeColorLeft;
        params.colorSecondaire = storeColorRight;
        params.mainWord = storeMainTitle;
        params.scriptPhrase = storeSubTitle;
        params.infoLine = storeInfoLine;
        params.textPromo = storeTextPromo;
        if (storeSubject && !storeImage) {
          params.subject = storeSubject;
          params.userQuery = params.userQuery ? `${params.userQuery} - Sujet: ${storeSubject}` : `Sujet: ${storeSubject}`;
        }
      } else {
        params.style = selectedStyle;
      }

      if (effectiveCategory === 'Social') {
        const socialResponse = await AiService.generateSocial(params, seed);
        if (mode === 'text' || mode === 'both') setResult(socialResponse.text || socialResponse.content || '');
        if (mode === 'image' || mode === 'both') {
          setImageUrl(socialResponse.image || socialResponse.url || '');
          if (socialResponse.seed !== undefined) setSeed(socialResponse.seed);
        }
        setGenerationId(socialResponse.generationId);

        if (socialResponse.isAsync) {
          let isCompleted = false;
          let attempts = 0;
          const maxAttempts = 60;
          while (!isCompleted && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
            try {
              const updatedGen = await AiService.getConversation(socialResponse.generationId.toString());
              const img = updatedGen?.imageUrl || updatedGen?.url || updatedGen?.image;
              if (img && typeof img === 'string' && img.startsWith('http')) {
                setImageUrl(img);
                isCompleted = true;
              } else if (updatedGen?.result?.startsWith('ERROR')) {
                isCompleted = true;
                throw new Error(updatedGen.result);
              }
            } catch (pollError) {
              console.warn('Social poll error:', pollError);
            }
          }
        }
      } else if (effectiveCategory === 'Image') {
        const isVisuelPub = effectiveFunction && effectiveFunction.includes('Visuel');

        if (isFlyerExact) {
          const flyerResult = await AiService.generateFlyer(params, seed);
          if (flyerResult.isAsync) {
            setGenerationId(flyerResult.generationId);
            let isCompleted = false;
            let attempts = 0;
            while (!isCompleted && attempts < 60) {
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 5000));
              const updatedGen = await AiService.getConversation(flyerResult.generationId.toString());
              if (updatedGen?.imageUrl?.startsWith('http')) {
                setImageUrl(updatedGen.imageUrl);
                isCompleted = true;
              } else if (updatedGen?.result?.startsWith('ERROR')) {
                isCompleted = true;
                throw new Error(updatedGen.result);
              }
            }
          } else {
            setImageUrl(flyerResult.url);
            setGenerationId(flyerResult.generationId);
          }
        } else if (isVisuelPub) {
          const resultData = await AiService.generateImage(params, (selectedStyle as any) || 'realistic', seed);
          if (!resultData.url && resultData.generationId) {
            setGenerationId(resultData.generationId);
            let isCompleted = false;
            let attempts = 0;
            while (!isCompleted && attempts < 60) {
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 5000));
              const updatedGen = await AiService.getConversation(resultData.generationId.toString());
              const img = updatedGen?.imageUrl || updatedGen?.url || updatedGen?.image;
              if (img && typeof img === 'string' && img.startsWith('http')) {
                setImageUrl(img);
                isCompleted = true;
              } else if (updatedGen?.result?.startsWith('ERROR')) {
                isCompleted = true;
                throw new Error(updatedGen.result);
              }
            }
          } else {
            setImageUrl(resultData.url || resultData.image || resultData.imageUrl || '');
            setGenerationId(resultData.generationId);
          }
        }
      } else if (effectiveCategory === 'Document') {
        if (isFlyerExact) {
          const flyerResult = await AiService.generateFlyer(params, seed);
          if (!flyerResult.url && flyerResult.generationId) {
            setGenerationId(flyerResult.generationId);
            let isCompleted = false;
            let attempts = 0;
            while (!isCompleted && attempts < 60) {
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 5000));
              const updatedGen = await AiService.getConversation(flyerResult.generationId.toString());
              const img = updatedGen?.imageUrl || updatedGen?.url || updatedGen?.image;
              if (img && typeof img === 'string' && img.startsWith('http')) {
                setImageUrl(img);
                isCompleted = true;
              }
            }
          } else {
            setImageUrl(flyerResult.url);
            setResult(flyerResult.url);
            setGenerationId(flyerResult.generationId);
          }
        } else {
          const resultData = await AiService.generateDocument('business', params);
          setResult(resultData.content);
          setGenerationId(resultData.generationId);
        }
      } else if (effectiveCategory === 'Texte') {
        const resultData = await AiService.generateText(params, effectiveCategory.toLowerCase() as TextGenerationType);
        setResult(resultData.content);
        setGenerationId(resultData.generationId);
      } else if (effectiveCategory === 'Video') {
        const videoResponse = await AiService.generateVideo(params, seed);
        setImageUrl(videoResponse.url);
        setResult(videoResponse.url);
        setGenerationId(videoResponse.generationId);
      } else if (effectiveCategory === 'Audio') {
        const audioResponse = await AiService.generateAudio(params, seed);
        setResult(audioResponse.content);
        setImageUrl(null);
        setGenerationId(audioResponse.generationId);
      }
    } catch (error: any) {
      console.error('[CRITICAL] Generation error details:', error);
      const errMsg = error?.response?.data?.message || error.message || 'Erreur inconnue';
      showModal('error', 'Erreur de génération', errMsg);
      setResult('Une erreur est survenue lors de la génération. ' + errMsg);
    } finally {
      setLoading(false);
      await aiRefreshUser();
    }
  };

  
  useEffect(() => {
    if(true) return;
    const checkStoreAndGenerate = () => {
      const state = useCreationStore.getState();

      if (state.selectedCategory || state.selectedFunction) {
        generateContent();
      } else {
        const timer = setTimeout(() => {
          const latestState = useCreationStore.getState();
          if (latestState.selectedCategory || latestState.selectedFunction) {
            generateContent();
          } else {
            setLoading(false);
            setResult('Erreur : Session expirée ou données manquantes.');
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    if (useCreationStore.persist.hasHydrated()) {
      checkStoreAndGenerate();
    } else {
      const unsub = useCreationStore.persist.onFinishHydration(() => {
        checkStoreAndGenerate();
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        try { await MediaLibrary.requestPermissionsAsync(); } catch (e) { }
        try { await Notifications.requestPermissionsAsync(); } catch (e) { }
      } catch (e) { }
    };
    requestPermissions();
  }, []);

  const handleSaveToGallery = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        const permission = await requestPermission();
        if (!permission.granted) {
          showModal('error', 'Permission refusée', "Nous avons besoin de votre permission pour enregistrer l'image.");
          return;
        }
      }

      showModal('loading', 'Enregistrement...', 'Sauvegarde dans votre galerie.');
      const filename = `Hipster-${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadRes.status !== 200) throw new Error('Download failed');

      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      const album = await MediaLibrary.getAlbumAsync('Hipster');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Hipster', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      setModalVisible(false);
      showModal('success', 'Enregistré !', "L'image a été ajoutée à votre galerie");
    } catch (error: any) {
      console.error('Save to gallery error:', error);
      setModalVisible(false);
      showModal('error', 'Erreur', "Impossible d'enregistrer l'image.");
    }
  };

  const handleShare = async () => {
    if (isRestricted) {
      showModal('error', 'Pack Curieux', 'Le partage est indisponible avec le Pack Curieux.');
      return;
    }
    try {
      if (selectedCategory === 'Image' || imageUrl) {
        showModal('loading', 'Préparation', "Téléchargement de l'image...");
        const remoteUrl = imageUrl || result;
        if (!remoteUrl) return;
        const filename = `share-${Date.now()}.png`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        const res = await FileSystem.downloadAsync(remoteUrl, fileUri);
        setModalVisible(false);
        if (res.status === 200) {
          await Sharing.shareAsync(res.uri);
        }
      } else if (selectedCategory === 'Document' || result) {
        await RNShare.share({
          message: getVisibleText(result),
          title: 'Mon contenu Hipster IA',
        });
      }
    } catch (error) {
      setModalVisible(false);
      showModal('error', 'Erreur', 'Impossible de partager.');
    }
  };

  const handleFinish = () => {
    reset();
    router.replace('/(drawer)');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Video
          source={require('../../assets/video/loadingVideoFinal.mp4')}
          style={styles.loadingVideo}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
      </View>
    );
  }

  const hasImage = imageUrl && (selectedCategory === 'Image' || selectedCategory === 'Social' || selectedCategory === 'Document');

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <View style={styles.iconGlow}>
            <ArrowLeft size={24} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.successBadgeInline}>
          <View style={styles.successIconSmall}>
            <Check size={16} color={'#fff'} />
          </View>
          <Text style={styles.successTextInline}>Votre contenu est prêt !</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={handleFinish}>
          <View style={styles.iconGlow}>
            <Home size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {hasImage ? (
        <ScrollView style={styles.fullscreenContainer} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: imageUrl }} style={styles.fullscreenImage} resizeMode="contain" />
          
          <View style={styles.bottomOverlay}>
            {/* <View style={styles.infoSection}>
              {selectedCategory === 'Document' && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>Document structuré</Text>
                </View>
              )}
              
              {(selectedCategory === 'Social' || selectedCategory === 'Image') && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>Visuel généré</Text>
                </View>
              )}
            </View> */}

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSaveToGallery}>
                <View style={styles.iconGlow}>
                  <Download size={18} color={'#fff'} />
                </View>
                <Text style={styles.actionButtonText}>Enregistrer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <View style={styles.iconGlow}>
                  <ShareIcon size={18} color={'#fff'}  />
                </View>
                <Text style={styles.actionButtonText}>Partager</Text>
              </TouchableOpacity>
            </View>

            {selectedCategory === 'Social' && result && (
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>{result}</Text>
              </View>
            )}

            <View style={styles.regenerateButtonWrapper}>
              {!showRegeneratePanel ? (
                <NeonActionButton
                  label="Modifier et régénérer"
                  onPress={() => setShowRegeneratePanel(true)}
                  icon={<Sparkles size={16} color="#ffffff" />}
                  small={false}
                />
              ) : (
                <View style={styles.regeneratePanel}>
                  <View style={styles.regeneratePanelHeader}>
                    <Text style={styles.regeneratePanelTitle}>Modifier ma demande</Text>
                    <TouchableOpacity onPress={() => setShowRegeneratePanel(false)}>
                      <X size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.regenerateInput}
                    multiline
                    value={localQuery}
                    onChangeText={setLocalQuery}
                    placeholder="Ex: Changez les couleurs, ajoutez plus de texte..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                  <View style={styles.modeSelector}>
                    <Text style={styles.modeLabel}>Régénérer :</Text>
                    <View style={styles.modeOptionsRow}>
                      {['text', 'image', 'both'].filter(id => {
                        if (selectedCategory === 'Social') return true;
                        if (selectedCategory === 'Image') return id === 'image';
                        if (selectedCategory === 'Texte') return id === 'text';
                        return true;
                      }).map(id => (
                        <TouchableOpacity
                          key={id}
                          style={[styles.modeItem, regenMode === id && styles.modeItemSelected]}
                          onPress={() => setRegenMode(id as any)}>
                          <Text style={[styles.modeItemText, regenMode === id && styles.modeItemTextSelected]}>
                            {id === 'both' ? 'Les deux' : id === 'text' ? 'Texte' : 'Image'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <NeonActionButton
                    label="Régénérer"
                    onPress={() => generateContent(localQuery, regenMode)}
                    small={false}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            <View style={styles.resultCard}>
              {selectedCategory === 'Document' && (
                <View style={styles.documentSection}>
                  <View style={styles.documentHeader}>
                    <FileText size={32} color={colors.neonBlue} />
                    <Text style={styles.documentTitle}>Document structuré</Text>
                  </View>
                  <View style={styles.structuredContent}>
                    <Text selectable={true} style={styles.contentText}>{getVisibleText(result)}</Text>
                  </View>
                </View>
              )}

              {selectedCategory === 'Texte' && (
                <View style={styles.textSection}>
                  <View style={styles.textHeader}>
                    <Sparkles size={24} color={colors.neonBlue} />
                    <Text style={styles.textTitle}>Contenu généré</Text>
                  </View>
                  <View>
                    {getParsedData(result) ? (
                      <View style={styles.jsonContainer}>
                        {Object.entries(getParsedData(result)).map(([key, value]) => {
                          if (key === 'corps_de_texte' || key === 'message_principal') return null;
                          return (
                            <View key={key} style={styles.jsonField}>
                              <Text style={styles.jsonKey}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                              <Text style={styles.jsonValue}>{String(value)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text selectable={true} style={styles.contentText}>{result}</Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.textActionsBar}>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                  <ShareIcon size={18} color={colors.neonBlue} />
                  <Text style={styles.iconButtonText}>Partager</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.regenerateSection}>
              {!showRegeneratePanel ? (
                <NeonActionButton
                  label="Modifier et régénérer"
                  onPress={() => setShowRegeneratePanel(true)}
                  small={false}
                />
              ) : (
                <View style={styles.regeneratePanel}>
                  <View style={styles.regeneratePanelHeader}>
                    <Text style={styles.regeneratePanelTitle}>Modifier ma demande</Text>
                    <TouchableOpacity onPress={() => setShowRegeneratePanel(false)}>
                      <X size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.regenerateInput}
                    multiline
                    value={localQuery}
                    onChangeText={setLocalQuery}
                    placeholder="Ex: Changez les couleurs, ajoutez plus de texte..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                  <View style={styles.modeSelector}>
                    <Text style={styles.modeLabel}>Régénérer :</Text>
                    <View style={styles.modeOptionsRow}>
                      {['text', 'image', 'both'].filter(id => {
                        if (selectedCategory === 'Social') return true;
                        if (selectedCategory === 'Image') return id === 'image';
                        if (selectedCategory === 'Texte') return id === 'text';
                        return true;
                      }).map(id => (
                        <TouchableOpacity
                          key={id}
                          style={[styles.modeItem, regenMode === id && styles.modeItemSelected]}
                          onPress={() => setRegenMode(id as any)}>
                          <Text style={[styles.modeItemText, regenMode === id && styles.modeItemTextSelected]}>
                            {id === 'both' ? 'Les deux' : id === 'text' ? 'Texte' : 'Image'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <NeonActionButton
                    label="Régénérer"
                    onPress={() => generateContent(localQuery, regenMode)}
                    small={false}
                  />
                </View>
              )}
            </View>
            <View style={styles.footerSpacer} />
          </View>
        </ScrollView>
      )}

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.darkSlateBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.3)',
  },
  successIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(30,155,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTextInline: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  loadingVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenImage: {
    width: '100%',
    marginTop : 90,
    height: height * 0.7 ,
    backgroundColor: 'transparent',
  },
  bottomOverlay: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: colors.midnightBlue,
  },
  captionContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.3)',
  },
  captionText: {
    fontFamily: fonts.arimo.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  regenerateButtonWrapper: {
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  documentSection: {
    padding: 20,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  documentTitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 18,
    color: colors.text.primary,
  },
  structuredContent: {
    gap: 16,
  },
  contentText: {
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.primary,
  },
  textSection: {
    padding: 20,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  textTitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    color: colors.neonBlue,
  },
  textActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
  },
  iconButton: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: colors.darkSlateBlue,
    flexDirection: 'row',
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  iconButtonText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: colors.neonBlue,
  },
  regenerateSection: {
    marginTop: 24,
  },
  regeneratePanel: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  regeneratePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regeneratePanelTitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    color: colors.text.primary,
  },
  regenerateInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    padding: 14,
    color: colors.text.primary,
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeSelector: {
    gap: 10,
  },
  modeLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: colors.text.secondary,
  },
  modeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  modeItemSelected: {
    backgroundColor: colors.neonBlue,
    borderColor: colors.neonBlue,
  },
  modeItemText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: colors.text.secondary,
  },
  modeItemTextSelected: {
    color: colors.background.dark,
  },
  footerSpacer: {
    height: 40,
  },
  jsonContainer: {
    gap: 14,
  },
  jsonField: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  jsonKey: {
    fontFamily: fonts.arimo.bold,
    fontSize: 11,
    color: colors.neonBlue,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  jsonValue: {
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    color : '#fff',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoBadgeText: {
    fontFamily: 'Brittany-Signature',
    fontSize: 28,
    color: '#fff',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    paddingVertical : 2
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.3)',
    backgroundColor: colors.darkSlateBlue,
  },
  actionButtonText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: '#fff',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  iconGlow: {
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});