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
  Share as RNShare,
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
  Share as ShareIcon,
  Home,
  Check,
  Copy,
  Download,
  FileText,
  RefreshCcw,
  Sparkles,
  Image as LucideImage,
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
import { api } from '../../api/client';
import { WORKFLOWS } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { VISUAL_ARCHITECTURES } from '../../constants/visualArchitectures';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const { width } = Dimensions.get('window');

export default function Step4ResultScreen() {
  const router = useRouter();

  // Direct store values for rendering (reactive)
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

  const textRemaining = Math.max(0, promptLimit - promptUsed);
  const imagesRemaining = Math.max(0, imagesLimit - imagesUsed);

  const isTextExhausted = isPackCurieux && promptLimit > 0 && promptUsed >= promptLimit && promptLimit !== 999999;
  const isImagesExhausted = isPackCurieux && imagesLimit > 0 && imagesUsed >= imagesLimit && imagesLimit !== 999999;
  const isFullyExhausted = isPackCurieux && isTextExhausted && isImagesExhausted;

  // Check Expiration
  const now = new Date();
  const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const isExpired = endDate && now > endDate;
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [seed, setSeed] = useState<number | undefined>();
  const [localQuery, setLocalQuery] = useState('');
  const [regenMode, setRegenMode] = useState<'text' | 'image' | 'both'>('text');

  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
      // Ignored
    }
    return null;
  };

  const copyValueToClipboard = async (key: string, value: any) => {
    if (isRestricted) {
      showModal('error', 'Pack Curieux', 'Le copier-coller est indisponible.');
      return;
    }

    let textToCopy = '';
    if (typeof value === 'string') {
      textToCopy = value;
    } else if (Array.isArray(value)) {
      textToCopy = value
        .map((item) => {
          if (typeof item === 'object') {
            return Object.entries(item)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n');
          }
          return `• ${String(item)}`;
        })
        .join('\n');
    } else {
      textToCopy = JSON.stringify(value, null, 2);
    }

    await Clipboard.setStringAsync(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderFlyerImage = () => {
    if (!imageUrl) return null;

    return (
      <View style={styles.imageContainer}>
        <View style={styles.imageHeader}>
          <Text selectable={true} style={styles.imageLabel}>
            Visuel Généré
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => copyValueToClipboard('flyer_image', imageUrl)}
              style={styles.miniCopyButton}>
              {copiedKey === 'flyer_image' ? (
                <Check size={16} color={colors.primary.main} />
              ) : (
                <Copy size={16} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.imageWrapper}>
          {imageUrl && imageUrl.trim() ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.flyerImage}
              resizeMode="contain"
              onError={(e) => console.error('[Image Error]', e.nativeEvent.error)}
            />
          ) : (
            <Text style={{ color: colors.text.muted, textAlign: 'center' }}>
              URL d'image invalide: {imageUrl}
            </Text>
          )}
        </View>
        <View style={styles.imageSeparator} />
      </View>
    );
  };

  const renderJsonResult = (data: any) => {
    if (!data || typeof data !== 'object') return null;

    return (
      <View style={styles.jsonContainer}>
        {Object.entries(data).map(([key, value], index) => {
          if (key === 'corps_de_texte' || key === 'message_principal') return null;
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <View key={key} style={styles.jsonField}>
              <View style={styles.jsonFieldHeader}>
                <Text selectable={true} style={styles.jsonKey}>
                  {formattedKey}
                </Text>
                <TouchableOpacity
                  onPress={() => copyValueToClipboard(key, value)}
                  style={styles.miniCopyButton}>
                  {copiedKey === key ? (
                    <Check size={14} color={colors.primary.main} />
                  ) : (
                    <Copy size={14} color={colors.text.muted} />
                  )}
                </TouchableOpacity>
              </View>

              {typeof value === 'string' ? (
                <Text selectable={true} style={styles.jsonValue}>
                  {value}
                </Text>
              ) : Array.isArray(value) ? (
                <View style={styles.jsonValueList}>
                  {value.map((item, i) => (
                    <View key={i} style={[styles.jsonListItem, { position: 'relative' }]}>
                      {typeof item === 'object' ? (
                        <View style={styles.jsonSubObjectCard}>
                          {Object.entries(item).map(([k, v]) => (
                            <Text selectable={true} key={k} style={styles.jsonSubValue}>
                              <Text
                                selectable={true}
                                style={{ fontWeight: '700', color: colors.primary.main }}>
                                {k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ')} :{' '}
                              </Text>
                              {String(v)}
                            </Text>
                          ))}
                          <TouchableOpacity
                            onPress={() => copyValueToClipboard(`${key}_${i}`, item)}
                            style={styles.miniCopyButtonAbsolute}>
                            {copiedKey === `${key}_${i}` ? (
                              <Check size={12} color={colors.primary.main} />
                            ) : (
                              <Copy size={12} color={colors.text.muted} />
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text selectable={true} style={styles.jsonValueListItem}>
                          • {String(item)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : typeof value === 'object' && value !== null ? (
                <View style={[styles.jsonSubObjectCard, { marginTop: 8 }]}>
                  {Object.entries(value).map(([k, v]) => (
                    <Text selectable={true} key={k} style={styles.jsonSubValue}>
                      <Text
                        selectable={true}
                        style={{ fontWeight: '700', color: colors.primary.main }}>
                        {k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ')} :{' '}
                      </Text>
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text selectable={true} style={styles.jsonValue}>
                  {String(value)}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const getVisibleText = (rawResult: string | null): string => {
    if (!rawResult) return '';
    const data = getParsedData(rawResult);
    if (!data) return rawResult;

    let textArr: string[] = [];

    const processValue = (key: string, val: any) => {
      if (key === 'corps_de_texte' || key === 'message_principal') return; // Skip main message
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
    // CRITICAL: Get latest state from store to avoid stale closures
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

    // Fallback logic if store is partially empty (e.g. after refresh)
    if (!effectiveCategory && effectiveFunction) {
      if (effectiveFunction.includes('Flyers')) effectiveCategory = 'Document';
      else if (effectiveFunction.includes('réseaux')) effectiveCategory = 'Social';
      else if (effectiveFunction.includes('Visuel')) effectiveCategory = 'Image';
      else if (effectiveFunction.includes('SEO') || effectiveFunction.includes('Email')) effectiveCategory = 'Texte';
    }

    console.log('[DEBUG] generateContent START', {
      mode,
      effectiveCategory,
      effectiveFunction,
      selectedArchitecture
    });

    if (!effectiveCategory) {
      console.error('[CRITICAL] effectiveCategory is null in generateContent');
      setResult('Erreur : Session expirée ou catégorie non sélectionnée.');
      setLoading(false);
      return;
    }

    const needsText = mode === 'text' || mode === 'both';
    const needsImage = mode === 'image' || mode === 'both';

    setLoading(true);
    setRegenMode(mode);

    try {
      // If we are regenerating only one part, don't clear the other
      if (mode === 'text' || mode === 'both') setResult('');
      if (mode === 'image' || mode === 'both') setImageUrl('');
      setShowRegeneratePanel(false);

      const isFlyerExact = effectiveFunction && effectiveFunction.includes('Flyers');
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
          // We can also append it to the userQuery so the backend LLM uses it intuitively
          params.userQuery = params.userQuery ? `${params.userQuery} - Sujet: ${storeSubject}` : `Sujet: ${storeSubject}`;
        }
      } else {
        params.style = selectedStyle;
      }

      console.log('[DEBUG] Generating Content with params:', JSON.stringify(params), 'Seed:', seed);

      // Specialized prompts per category
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
    // Robust mount handling for persistent store
    const checkStoreAndGenerate = () => {
      const state = useCreationStore.getState();
      console.log('[DEBUG] Step4ResultScreen MOUNT CHECK', {
        hasHydrated: useCreationStore.persist.hasHydrated(),
        selectedCategory: state.selectedCategory,
        selectedFunction: state.selectedFunction,
        selectedArchitecture: state.selectedArchitecture
      });

      if (state.selectedCategory || state.selectedFunction) {
        generateContent();
      } else {
        console.warn('[DEBUG] Delaying generateContent: store not ready or empty');
        const timer = setTimeout(() => {
          const latestState = useCreationStore.getState();
          if (latestState.selectedCategory || latestState.selectedFunction) {
            generateContent();
          } else {
            console.error('[DEBUG] Store STILL not ready after 2s', {
              latestState,
              hasHydrated: useCreationStore.persist.hasHydrated()
            });
            setLoading(false);
            setResult('Erreur : Session expirée ou données manquantes.');
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    // If already hydrated, check immediately. Otherwise wait for hydration.
    if (useCreationStore.persist.hasHydrated()) {
      checkStoreAndGenerate();
    } else {
      const unsub = useCreationStore.persist.onFinishHydration(() => {
        console.log('[DEBUG] Store hydration finished');
        checkStoreAndGenerate();
      });
      return () => unsub();
    }
  }, []); // Explicitly mount only

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        try {
          await MediaLibrary.requestPermissionsAsync();
        } catch (e) { }
        try {
          await Notifications.requestPermissionsAsync();
        } catch (e) { }
      } catch (e) { }
    };
    requestPermissions();
  }, []);

  const handleCopyText = async () => {
    if (isRestricted) {
      showModal('error', 'Pack Curieux', 'Le copier-coller est indisponible avec le Pack Curieux.');
      return;
    }
    if (!result) return;
    const cleanText = getVisibleText(result);
    await Clipboard.setStringAsync(cleanText);
    showModal('success', 'Copié !', 'Le texte a été copié dans votre presse-papier');
  };

  const handleSaveToGallery = async () => {
    // if (isRestricted) {
    //   showModal('error', 'Pack Curieux', 'La sauvegarde est indisponible avec le Pack Curieux.');
    //   return;
    // }
    // if (!imageUrl) return;

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

  return (
    <GuidedScreenWrapper
      headerRight={
        <View style={{ marginRight: 8 }}>
          <NeonButton
            title="Terminer"
            onPress={handleFinish}
            variant="ghost"
            size="sm"
            icon={<Home size={16} color={colors.primary.main} />}
          />
        </View>
      }>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            {loading ? (
              <View style={styles.skeletonWrapper}>
                <Animated.View style={[styles.skeletonImage, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.skeletonTitle, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.skeletonLine, { opacity: pulseAnim, width: '90%' }]} />
                <Animated.View style={[styles.skeletonLine, { opacity: pulseAnim, width: '75%' }]} />
                <Animated.View style={[styles.skeletonLine, { opacity: pulseAnim, width: '60%' }]} />
                <Text style={styles.skeletonLabel}>Hipster•IA génère votre contenu...</Text>
              </View>
            ) : (
              <>
                <View style={styles.successIcon}>
                  <Check size={32} color={colors.background.dark} />
                </View>
                <Text selectable={true} style={styles.title}>Votre contenu est prêt !</Text>
              </>
            )}
          </View>

          {!loading && (
            <View style={styles.resultCard}>
              {selectedCategory === 'Social' && (
                <View style={styles.socialCard}>
                  <View style={styles.socialHeader}>
                    <View style={styles.socialAvatar}><Sparkles size={16} color={colors.primary.main} /></View>
                    <View>
                      <Text style={styles.socialUser}>Hipster IA</Text>
                      <Text style={styles.socialTime}>À l'instant • Publicité</Text>
                    </View>
                  </View>
                  <View style={[styles.socialImageSection, { aspectRatio: 0.8 }]}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.generatedImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.generatedImage, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#999', fontSize: 14 }}>Image en cours...</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.socialCaptionSection}>
                    <Text selectable={true} style={styles.socialCaptionText}>{result}</Text>
                  </View>
                </View>
              )}

              {selectedCategory === 'Image' && (
                <View style={styles.imageSection}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.generatedImage} resizeMode="contain" />
                  ) : (
                    <View style={[styles.generatedImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8 }]}>
                      <Text style={{ color: '#999', fontSize: 14 }}>Image en cours...</Text>
                    </View>
                  )}
                </View>
              )}

              {selectedCategory === 'Document' && (
                <View style={styles.documentSection}>
                  <View style={styles.documentHeader}>
                    <FileText size={32} color={colors.primary.main} />
                    <Text selectable={true} style={styles.documentTitle}>Document structuré</Text>
                  </View>
                  {imageUrl && renderFlyerImage()}
                  <View style={styles.structuredContent}>
                    <Text selectable={true} style={styles.contentText}>{getVisibleText(result)}</Text>
                  </View>
                </View>
              )}

              {selectedCategory === 'Texte' && (
                <View style={styles.textSection}>
                  {imageUrl && (
                    <View style={[styles.socialImageSection, { aspectRatio: 0.8, marginBottom: 20 }]}>
                      <Image source={{ uri: imageUrl }} style={styles.generatedImage} resizeMode="cover" />
                    </View>
                  )}
                  <View>{renderJsonResult(getParsedData(result)) || <Text selectable={true} style={styles.contentText}>{result}</Text>}</View>
                </View>
              )}

              <View style={styles.actionsBar}>
                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                  <NeonButton title="Copier" onPress={handleCopyText} variant="ghost" size="sm" icon={<Copy size={16} color={colors.neon.primary} />} />
                </View>
                {(selectedCategory === 'Image' || selectedCategory === 'Social' || imageUrl) && (
                  <View style={{ flex: 1, paddingHorizontal: 4 }}>
                    <NeonButton title="Enregistrer" onPress={handleSaveToGallery} variant="ghost" size="sm" icon={<Download size={16} color={colors.neon.primary} />} />
                  </View>
                )}
                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                  <NeonButton title="Partager" onPress={handleShare} variant="ghost" size="sm" icon={<ShareIcon size={16} color={colors.neon.primary} />} />
                </View>
              </View>
            </View>
          )}

          {!loading && (
            <View style={styles.regenerateSection}>
              {!showRegeneratePanel ? (
                <NeonButton title="Modifier et régénérer" onPress={() => setShowRegeneratePanel(true)} variant="outline" size="md" icon={<RefreshCcw size={18} color={colors.neon.primary} />} style={{ width: '100%' }} />
              ) : (
                <View style={styles.regeneratePanel}>
                  <View style={styles.regeneratePanelHeader}>
                    <Text style={styles.regeneratePanelTitle}>Modifier ma demande</Text>
                    <TouchableOpacity onPress={() => setShowRegeneratePanel(false)}><X size={24} color={colors.text.secondary} /></TouchableOpacity>
                  </View>
                  <TextInput style={styles.regenerateInput} multiline value={localQuery} onChangeText={setLocalQuery} placeholder="Ex: Changez les couleurs, ajoutez plus de texte..." placeholderTextColor="rgba(255,255,255,0.3)" />
                  <View style={styles.modeSelector}>
                    <Text style={styles.modeLabel}>Régénérer :</Text>
                    <View style={styles.modeOptionsRow}>
                      {['text', 'image', 'both'].filter(id => {
                        if (selectedCategory === 'Social') return true;
                        if (selectedCategory === 'Image') return id === 'image';
                        if (selectedCategory === 'Texte') return id === 'text';
                        return true;
                      }).map(id => (
                        <TouchableOpacity key={id} style={[styles.modeItem, regenMode === id && styles.modeItemSelected]} onPress={() => setRegenMode(id as any)}>
                          <Text style={[styles.modeItemText, regenMode === id && styles.modeItemTextSelected]}>{id === 'both' ? 'Les deux' : id === 'text' ? 'Texte' : 'Image'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <NeonButton title="Régénérer" onPress={() => generateContent(localQuery, regenMode)} icon={<Sparkles size={20} color="#000" />} size="lg" variant="premium" />
                </View>
              )}
            </View>
          )}
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
      <GenericModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} />
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  skeletonWrapper: { width: '100%', paddingHorizontal: 4, gap: 12 },
  skeletonImage: { width: '100%', height: 220, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' },
  skeletonTitle: { width: '55%', height: 20, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)', alignSelf: 'center' },
  skeletonLine: { height: 14, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.07)' },
  skeletonLabel: { marginTop: 8, textAlign: 'center', fontSize: 13, color: colors.text.muted },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary.main, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  resultCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  socialCard: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.02)' },
  socialHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  socialAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.primary.main}20`, alignItems: 'center', justifyContent: 'center', borderWidt: 1, borderColor: `${colors.primary.main}40` },
  socialUser: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  socialTime: { fontSize: 11, color: colors.text.secondary },
  socialImageSection: { width: '100%', backgroundColor: '#000' },
  socialCaptionSection: { padding: 16, paddingTop: 12 },
  socialCaptionText: { fontSize: 14, lineHeight: 20, color: colors.text.primary },
  imageSection: { width: '100%' },
  generatedImage: { width: '100%', aspectRatio: 1 },
  documentSection: { padding: 24 },
  documentHeader: { alignItems: 'center', marginBottom: 24, gap: 12 },
  documentTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  structuredContent: { gap: 20, marginTop: 10 },
  contentText: { fontSize: 15, lineHeight: 24, color: colors.text.primary },
  textSection: { padding: 24 },
  actionsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 16, paddingHorizontal: 24 },
  regenerateSection: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  regeneratePanel: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: 16 },
  regeneratePanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  regeneratePanelTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  regenerateInput: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 16, padding: 16, color: colors.text.primary, fontSize: 15, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modeSelector: { marginVertical: 10, gap: 12 },
  modeLabel: { fontSize: 14, color: colors.text.secondary, fontWeight: '600' },
  modeOptionsRow: { flexDirection: 'row', gap: 10 },
  modeItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modeItemSelected: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  modeItemText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  modeItemTextSelected: { color: colors.background.dark, fontWeight: '700' },
  jsonContainer: { gap: 16 },
  jsonField: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  jsonKey: { fontSize: 12, fontWeight: '700', color: colors.primary.main, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  jsonValue: { fontSize: 15, lineHeight: 22, color: colors.text.primary },
  jsonValueList: { gap: 6 },
  jsonValueListItem: { fontSize: 14, lineHeight: 20, color: colors.text.secondary },
  jsonListItem: { marginBottom: 8 },
  jsonSubValue: { fontSize: 14, color: colors.text.primary, marginBottom: 4 },
  jsonFieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  miniCopyButton: { padding: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
  jsonSubObjectCard: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  miniCopyButtonAbsolute: { position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4 },
  imageContainer: { marginBottom: 24, borderRadius: 12, backgroundColor: colors.background.premium, borderWidth: 1, borderColor: `${colors.primary.main}30`, overflow: 'hidden' },
  imageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: `${colors.primary.main}10`, borderBottomWidth: 1, borderColor: `${colors.primary.main}20` },
  imageLabel: { fontSize: 14, fontWeight: '600', color: colors.primary.main },
  imageWrapper: { width: '100%', aspectRatio: 0.8, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' },
  flyerImage: { width: '100%', height: '100%' },
});
