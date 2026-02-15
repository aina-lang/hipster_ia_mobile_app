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
import { api } from '../../api/client';
import { WORKFLOWS } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';

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

const MODEL_IMAGES: Record<string, string> = {
  Moderne:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  Minimaliste:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
  Luxe: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=400&auto=format&fit=crop',
  Coloré:
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
};

export default function Step3ResultScreen() {
  const router = useRouter();
  const {
    userQuery,
    selectedJob,
    selectedFunction,
    selectedCategory,
    selectedStyle,
    uploadedImage,

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

  // ... (existing code)


  const [selectedModel, setSelectedModel] = useState('Moderne');
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

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
    setLocalQuery(userQuery);
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
          <Image source={{ uri: imageUrl }} style={styles.flyerImage} resizeMode="contain" />
        </View>
        <View style={styles.imageSeparator} />
      </View>
    );
  };

  const renderPosterResult = (data: any) => {
    return (
      <View style={styles.posterCard}>
        <View style={styles.posterHeader}>
          <Text selectable={true} style={styles.posterLabel}>
            Affiche Promotionnelle
          </Text>
          <TouchableOpacity
            onPress={() => copyValueToClipboard('affiche_complete', data)}
            style={styles.miniCopyButton}>
            {copiedKey === 'affiche_complete' ? (
              <Check size={16} color={colors.primary.main} />
            ) : (
              <Copy size={16} color={colors.primary.main} />
            )}
          </TouchableOpacity>
        </View>

        {data.titre_principal && (
          <View style={{ position: 'relative', marginBottom: 15 }}>
            <Text selectable={true} style={styles.posterTitle}>
              {data.titre_principal}
            </Text>
            <TouchableOpacity
              onPress={() => copyValueToClipboard('titre', data.titre_principal)}
              style={styles.miniCopyButtonAbsolute}>
              {copiedKey === 'titre' ? (
                <Check size={12} color={colors.primary.main} />
              ) : (
                <Copy size={12} color={colors.text.muted} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {data.sous_titre && (
          <View style={{ position: 'relative', marginBottom: 15 }}>
            <Text selectable={true} style={styles.posterSubtitle}>
              {data.sous_titre}
            </Text>
            <TouchableOpacity
              onPress={() => copyValueToClipboard('sous_titre', data.sous_titre)}
              style={styles.miniCopyButtonAbsolute}>
              {copiedKey === 'sous_titre' ? (
                <Check size={12} color={colors.primary.main} />
              ) : (
                <Copy size={12} color={colors.text.muted} />
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.posterSeparator} />

        {data.offres_speciales && data.offres_speciales !== '' && (
          <View style={styles.posterOfferCard}>
            <Text selectable={true} style={styles.posterOfferText}>
              {data.offres_speciales}
            </Text>
            <TouchableOpacity
              onPress={() => copyValueToClipboard('offre', data.offres_speciales)}
              style={styles.miniCopyButtonAbsolute}>
              {copiedKey === 'offre' ? (
                <Check size={12} color={colors.primary.main} />
              ) : (
                <Copy size={12} color={colors.text.muted} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {data.informations_pratiques && (
          <View style={styles.posterInfo}>
            <Text selectable={true} style={styles.posterInfoText}>
              {data.informations_pratiques}
            </Text>
            <TouchableOpacity
              onPress={() => copyValueToClipboard('infos', data.informations_pratiques)}
              style={styles.miniCopyButtonAbsolute}>
              {copiedKey === 'infos' ? (
                <Check size={12} color={colors.primary.main} />
              ) : (
                <Copy size={12} color={colors.text.muted} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {data.appel_a_l_action && (
          <NeonButton
            title={data.appel_a_l_action}
            onPress={() => copyValueToClipboard('cta', data.appel_a_l_action)}
            variant="premium"
            size="md"
            style={{ marginTop: 12 }}
          />
        )}
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

    // Priority keys or all keys if generic
    const keys = Object.keys(data);
    keys.forEach((key) => processValue(key, data[key]));

    return textArr.join('\n').trim();
  };

  const generateContent = async (
    overrideQuery?: string,
    mode: 'text' | 'image' | 'both' = 'both'
  ) => {
    console.log('generateContent', { mode });

    // if (loading) return;

    // Check credits before starting
    const needsText = mode === 'text' || mode === 'both';
    const needsImage = mode === 'image' || mode === 'both';

    if (needsText && isTextExhausted) {
      const textLimitMsg = promptLimit >= 999999 ? 'illimitée' : `de ${promptLimit} texte${promptLimit > 1 ? 's' : ''}`;
      showModal('error', 'Limite textes atteinte', `Vous avez atteint votre limite ${textLimitMsg} ${isPackCurieux ? 'par jour' : 'par mois'}. Vous pouvez encore générer des images !`);
      return;
    }
    if (needsImage && isImagesExhausted) {
      const imageLimitMsg = imagesLimit >= 999999 ? 'illimitée' : `de ${imagesLimit} image${imagesLimit > 1 ? 's' : ''}`;
      showModal('error', 'Limite images atteinte', `Vous avez atteint votre limite ${imageLimitMsg} ${isPackCurieux ? 'par jour' : 'par mois'}. Vous pouvez encore générer des textes !`);
      return;
    }
    if (isExpired && isPackCurieux) {
      showModal('error', 'Essai terminé', 'Votre essai de 7 jours est terminé. Veuillez passer au Pack Studio.');
      return;
    }

    setLoading(true);
    setRegenMode(mode);

    try {
      // If we are regenerating only one part, don't clear the other
      if (mode === 'text' || mode === 'both') setResult('');
      if (mode === 'image' || mode === 'both') setImageUrl('');
      setShowRegeneratePanel(false);

      if (!selectedCategory) {
        console.error('selectedCategory is null');
        setResult('Erreur : Catégorie non sélectionnée.');
        setLoading(false);
        return;
      }

      let finalReferenceImage = uploadedImage;
      // No longer converting to base64 here. AiService will handle the multipart upload if a URI is detected.


      const params = {
        job: selectedJob || 'Autre', // Safeguard against null job
        function: selectedFunction, // e.g. "Flyers / Affiches"
        userQuery: overrideQuery || userQuery,
        style: selectedStyle,
        reference_image: finalReferenceImage,
      };

      console.log('[DEBUG] Generating Content with params:', JSON.stringify(params, null, 2), 'Seed:', seed);

      // Specialized prompts per category
      if (selectedCategory === 'Social') {
        const socialResponse = await AiService.generateSocial(params, seed);
        if (mode === 'text' || mode === 'both') {
          setResult(socialResponse.content);
        }
        if (mode === 'image' || mode === 'both') {
          setImageUrl(socialResponse.url);
          if (socialResponse.seed !== undefined) setSeed(socialResponse.seed);
        }
        setGenerationId(socialResponse.generationId);
      } else if (selectedCategory === 'Image') {
        const isFlyer = selectedFunction && (selectedFunction.includes('Flyers') || selectedFunction.includes('publicitaire'));
        if (isFlyer) {
          const flyerResult = await AiService.generateFlyer(params, seed);
          setImageUrl(flyerResult.url);
          setResult(flyerResult.url);
          setGenerationId(flyerResult.generationId);
          if (flyerResult.seed !== undefined) setSeed(flyerResult.seed);
        } else {
          const resultData = await AiService.generateImage(
            params,
            (selectedStyle as any) || 'realistic',
            seed
          );
          setResult(resultData.url);
          setImageUrl(resultData.url);
          setGenerationId(resultData.generationId);
          if (resultData.seed !== undefined) setSeed(resultData.seed);
        }
      } else if (selectedCategory === 'Document') {
        const resultData = await AiService.generateDocument('business', params);
        setResult(resultData.content);
        setGenerationId(resultData.generationId);
      } else if (selectedCategory === 'Texte') {
        const isFlyer = selectedFunction && (selectedFunction.includes('Flyers') || selectedFunction.includes('publicitaire'));
        if (isFlyer) {
          const flyerResult = await AiService.generateFlyer(params, seed);
          setImageUrl(flyerResult.url);
          setResult(flyerResult.url);
          setGenerationId(flyerResult.generationId);
          if (flyerResult.seed !== undefined) setSeed(flyerResult.seed);
        } else {
          const resultData = await AiService.generateText(
            params,
            selectedCategory.toLowerCase() as TextGenerationType
          );
          setResult(resultData.content);
          setGenerationId(resultData.generationId);
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      const errMsg = error?.response?.data?.message || error.message || 'Erreur inconnue';
      showModal('error', 'Erreur de génération', errMsg);
      setResult('Une erreur est survenue lors du génération. ' + errMsg);
    } finally {
      setLoading(false);
      // Update credits in real-time
      await aiRefreshUser();
    }
  };

  useEffect(() => {
    generateContent();

    // Request permissions upfront
    const requestPermissions = async () => {
      try {
        await MediaLibrary.requestPermissionsAsync();
        await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.warn('Permission request error:', e);
      }
    };
    requestPermissions();
  }, []);

  const handleDownload = async (format: string) => {
    if (isRestricted) {
      showModal(
        'error',
        'Pack Curieux',
        'Le téléchargement est indisponible avec le Pack Curieux. Passez au plan Atelier ou Studio pour débloquer !'
      );
      return;
    }

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

      const apiBaseUrl = api.defaults.baseURL;
      const downloadUrl = `${apiBaseUrl}/ai/export/${generationId}?format=${format}&model=${selectedModel}`;
      const extension = format === 'excel' ? 'xlsx' : format === 'image' ? 'png' : format;
      const fileName = `Hipster_${generationId}_${Date.now()}.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const token = await AsyncStorage.getItem('access_token');

      const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri, {
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
            const contentUri = await FileSystem.getContentUriAsync(downloadRes.uri);
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
    } catch (error: any) {
      console.error('Download error:', error);
      setModalVisible(false);
      const msg = error?.message || String(error);
      showModal('error', 'Erreur', `Une erreur est survenue lors du téléchargement. ${msg}`);
    }
  };

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
    if (isRestricted) {
      showModal('error', 'Pack Curieux', 'La sauvegarde est indisponible avec le Pack Curieux.');
      return;
    }
    if (!imageUrl) return;

    try {
      if (permissionResponse?.status !== 'granted') {
        try {
          const permission = await requestPermission();
          if (!permission.granted) {
            showModal(
              'error',
              'Permission refusée',
              "Nous avons besoin de votre permission pour enregistrer l'image."
            );
            return;
          }
        } catch (permError: any) {
          console.warn('MediaLibrary.requestPermissionsAsync failed:', permError);
          // Expo Go on Android may reject this call due to scoped storage changes.
          // Fallback: download file and open share dialog so user can save it manually.
          try {
            showModal('loading', 'Préparation', "Téléchargement de l'image pour partage...");
            const filename = `Hipster-${Date.now()}.png`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;
            const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);
            setModalVisible(false);
            if (downloadRes.status === 200) {
              await Sharing.shareAsync(downloadRes.uri, { dialogTitle: 'Enregistrer l\'image' });
              showModal('info', 'Astuce', "Sur Expo Go Android, l'enregistrement direct nécessite une build de développement. Utilisez le partage pour sauvegarder l'image ou créez une build via EAS.");
            } else {
              showModal('error', 'Oups', 'Echec du téléchargement pour le partage.');
            }
          } catch (e) {
            console.error('Fallback share/download error:', e);
            setModalVisible(false);
            showModal('error', 'Erreur', "Impossible d'enregistrer l'image.");
          }
          return;
        }
      }

      showModal('loading', 'Enregistrement...', 'Sauvegarde dans votre galerie.');

      const filename = `Hipster-${Date.now()}.png`;
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) throw new Error('Cache directory not available');
      const fileUri = cacheDir.endsWith('/') ? `${cacheDir}${filename}` : `${cacheDir}/${filename}`;

      const downloadRes = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadRes.status !== 200) {
        throw new Error('Download failed');
      }

      let asset;
      try {
        asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      } catch (assetError: any) {
        console.warn('MediaLibrary.createAssetAsync failed:', assetError);
        // Fallback to sharing
        setModalVisible(false);
        await Sharing.shareAsync(downloadRes.uri, { dialogTitle: 'Enregistrer l\'image' });
        showModal('info', 'Astuce', "L'enregistrement direct a échoué. Utilisez le menu de partage pour sauvegarder l'image dans vos photos.");
        return;
      }

      try {
        const album = await MediaLibrary.getAlbumAsync('Hipster');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Hipster', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (albumError) {
        console.warn('Could not add to album, but asset saved:', albumError);
      }

      setModalVisible(false);
      showModal('success', 'Enregistré !', "L'image a été ajoutée à votre galerie");
    } catch (error: any) {
      console.error('Save to gallery error:', error);
      setModalVisible(false);
      const msg = error?.message || String(error);
      showModal('error', 'Erreur', `Impossible d'enregistrer l'image. ${msg}`);
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
        const fileUri = `${(FileSystem as any).cacheDirectory}${filename}`;

        const res = await (FileSystem as any).downloadAsync(remoteUrl, fileUri);
        setModalVisible(false);

        if (res.status === 200) {
          await Sharing.shareAsync(res.uri);
        } else {
          showModal('error', 'Oups', 'Echec du téléchargement pour le partage.');
        }
      } else if (selectedCategory === 'Document') {
        // Pour un document, par défaut on partage le PDF
        handleDownload('pdf');
      } else if (result) {
        // Partage de texte classique
        await RNShare.share({
          message: getVisibleText(result),
          title: 'Mon contenu Hipster IA',
        });
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
          {/* Header simplifié */}
          <View style={styles.header}>
            {loading ? (
              <View style={styles.loadingHeader}>
                <DeerAnimation size={60} progress={50} />
                <Text selectable={true} style={styles.loadingTitle}>
                  Création en cours...
                </Text>
                <Text selectable={true} style={styles.loadingSubtitle}>
                  Hipster•IA travaille pour vous
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.successIcon}>
                  <Check size={32} color={colors.background.dark} />
                </View>
                <Text selectable={true} style={styles.title}>
                  Votre contenu est prêt !
                </Text>
              </>
            )}
          </View>

          {/* Main Result Card */}
          <View style={styles.resultCard}>
            {/* 📱 SOCIAL CATEGORY (Image + Caption) */}
            {selectedCategory === 'Social' && (
              <View style={styles.socialCard}>
                <View style={styles.socialHeader}>
                  <View style={styles.socialAvatar}>
                    <Sparkles size={16} color={colors.primary.main} />
                  </View>
                  <View>
                    <Text style={styles.socialUser}>Hipster IA</Text>
                    <Text style={styles.socialTime}>À l'instant • Publicité</Text>
                  </View>
                </View>

                {/* Image Section */}
                <View style={[styles.socialImageSection, { aspectRatio: 0.8 }]}>
                  {loading || (regenMode === 'image' && imageUrl === '') ? (
                    <View style={styles.imagePlaceholder}>
                      <LucideImage size={48} color="rgba(255,255,255,0.2)" />
                      <Text selectable={true} style={styles.placeholderText}>
                        Génération du visuel...
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: imageUrl || '' }}
                      style={styles.generatedImage}
                      resizeMode="cover"
                    />
                  )}
                </View>

                {/* Caption Section */}
                <View style={styles.socialCaptionSection}>
                  {loading || (regenMode === 'text' && result === '') ? (
                    <View style={styles.textPlaceholder}>
                      {[1, 2, 3].map((i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.skeletonLine,
                            { width: i === 3 ? '60%' : '100%', opacity: pulseAnim },
                          ]}
                        />
                      ))}
                    </View>
                  ) : (
                    <Text selectable={true} style={styles.socialCaptionText}>
                      {result}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* 🖼️ IMAGE CATEGORY (Full Visual focus) */}
            {selectedCategory === 'Image' && (
              <View style={styles.imageSection}>
                {loading || (regenMode === 'image' && imageUrl === '') ? (
                  <View style={styles.imagePlaceholder}>
                    <LucideImage size={48} color="rgba(255,255,255,0.2)" />
                    <Text selectable={true} style={styles.placeholderText}>
                      Génération de l'image...
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: imageUrl || result || '' }}
                    style={styles.generatedImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}

            {/* 📄 DOCUMENT CATEGORY (Structured View) */}
            {selectedCategory === 'Document' && (
              <View style={styles.documentSection}>
                <View style={styles.documentHeader}>
                  <FileText size={32} color={colors.primary.main} />
                  <Text selectable={true} style={styles.documentTitle}>
                    Document structuré
                  </Text>
                </View>

                {loading || (regenMode === 'text' && result === '') ? (
                  <View style={styles.textPlaceholder}>
                    {[1, 2, 3, 4].map((i) => (
                      <Animated.View
                        key={i}
                        style={[
                          styles.skeletonLine,
                          { width: i === 4 ? '40%' : '100%', opacity: pulseAnim },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.structuredContent}>
                    {/* Model Picker for Documents */}
                    <TouchableOpacity
                      style={styles.modelSelector}
                      onPress={() => setShowModelPicker(!showModelPicker)}>
                      <Text selectable={true} style={styles.modelSelectorLabel}>
                        Design Export :
                      </Text>
                      <View style={styles.modelSelectorValue}>
                        <Text selectable={true} style={styles.modelSelectorText}>
                          {selectedModel}
                        </Text>
                        <ChevronDown size={20} color={colors.text.secondary} />
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
                              selectable={true}
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

                    {/* Export Choices for Documents */}
                    <View style={styles.exportButtons}>
                      <View style={{ flex: 1 }}>
                        <NeonButton
                          title="PDF"
                          onPress={() => handleDownload('pdf')}
                          variant="premium"
                          size="sm"
                          icon={<Download size={16} color={colors.text.primary} />}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <NeonButton
                          title="Word"
                          onPress={() => handleDownload('docx')}
                          variant="outline"
                          size="sm"
                          icon={<FileText size={16} color={colors.neon.primary} />}
                        />
                      </View>
                    </View>

                    {/* Content Preview */}
                    {(() => {
                      const data = getParsedData(result);
                      return data ? (
                        <View style={{ marginTop: 20 }}>
                          <Text selectable={true} style={styles.sectionTitle}>
                            {data.title || 'Contenu'}
                          </Text>
                          <Text selectable={true} style={styles.contentText}>
                            {data.presentation || result}
                          </Text>
                        </View>
                      ) : (
                        <Text selectable={true} style={styles.contentText}>
                          {result}
                        </Text>
                      );
                    })()}
                  </View>
                )}
              </View>
            )}

            {/* ✍️ TEXT CATEGORY (Clean Reading focus) */}
            {selectedCategory === 'Texte' && (
              <View style={styles.textSection}>
                {loading || (regenMode === 'text' && result === '') ? (
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
                  <View>
                    {/* Display flyer image if it's a flyer */}
                    {imageUrl && selectedFunction?.includes('Flyers') && renderFlyerImage()}

                    <View style={{ marginTop: 12 }}>
                      {(() => {
                        const data = getParsedData(result);
                        if (data) {
                          // Si c'est une affiche (détectée par ses clés spécifiques)
                          // if (
                          //   data.titre_principal ||
                          //   (selectedFunction && selectedFunction.includes('Affiche'))
                          // ) {
                          //   return renderPosterResult(data);
                          // }
                          return renderJsonResult(data);
                        }
                        return (
                          <Text selectable={true} style={styles.contentText}>
                            {result}
                          </Text>
                        );
                      })()}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 🛠️ NAVIGATION & ACTIONS BAR (Generic but adapted) */}
            {!loading && (
              <View style={styles.actionsBar}>
                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                  <NeonButton
                    title="Copier"
                    onPress={handleCopyText}
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={16} color={colors.neon.primary} />}
                  />
                </View>

                {(selectedCategory === 'Image' || selectedCategory === 'Social' || imageUrl) && (
                  <View style={{ flex: 1, paddingHorizontal: 4 }}>
                    <NeonButton
                      title="Enregistrer"
                      onPress={handleSaveToGallery}
                      variant="ghost"
                      size="sm"
                      icon={<Download size={16} color={colors.neon.primary} />}
                    />
                  </View>
                )}

                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                  <NeonButton
                    title="Partager"
                    onPress={handleShare}
                    variant="ghost"
                    size="sm"
                    icon={<ShareIcon size={16} color={colors.neon.primary} />}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Panneau de régénération replié */}
          {!loading && (
            <>
              {/* Daily Quota Warnings */}
              {isPackCurieux && (
                <View style={{ marginBottom: 16, alignItems: 'center' }}>
                  {isTextExhausted && !isImagesExhausted && (
                    <Text style={{ fontSize: 13, color: '#fb923c', textAlign: 'center' }}>
                      Limite de textes atteinte aujourd'hui.
                    </Text>
                  )}
                  {!isTextExhausted && isImagesExhausted && (
                    <Text style={{ fontSize: 13, color: '#fb923c', textAlign: 'center' }}>
                      Limite d'images atteinte aujourd'hui.
                    </Text>
                  )}
                  {isFullyExhausted && (
                    <Text style={{ fontSize: 13, color: '#f87171', fontWeight: '700', textAlign: 'center' }}>
                      Limites quotidiennes atteintes (2/2). Revenez demain !
                    </Text>
                  )}
                  {!isFullyExhausted && (
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                      Restant aujourd'hui: {textRemaining} textes, {imagesRemaining} images
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.regenerateSection}>
                {!showRegeneratePanel ? (
                  <NeonButton
                    title="Modifier et régénérer"
                    onPress={() => setShowRegeneratePanel(true)}
                    variant="outline"
                    size="md"
                    icon={<RefreshCcw size={18} color={colors.neon.primary} />}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <View style={styles.regeneratePanel}>
                    <View style={styles.regeneratePanelHeader}>
                      <Text style={styles.regeneratePanelTitle}>Affinez votre demande</Text>
                      <TouchableOpacity onPress={() => setShowRegeneratePanel(false)}>
                        <X size={24} color={colors.text.secondary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.text.secondary, marginBottom: 20 }}>
                      Voulez-vous générer une nouvelle version de ce visuel ?
                    </Text>

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

                    {/* Choice for regeneration */}
                    <View style={styles.modeSelector}>
                      <Text style={styles.modeLabel}>Régénérer :</Text>
                      <View style={styles.modeOptionsRow}>
                        {[
                          { id: 'text', label: 'Texte', icon: <FileText size={16} /> },
                          { id: 'image', label: 'Image', icon: <LucideImage size={16} /> },
                          { id: 'both', label: 'Les deux', icon: <Sparkles size={16} /> },
                        ]
                          .filter((m) => {
                            if (selectedCategory === 'Social') return true;
                            if (selectedCategory === 'Texte') return m.id !== 'both';
                            if (selectedCategory === 'Image') return m.id === 'image';
                            return m.id === 'text';
                          })
                          .map((m) => (
                            <TouchableOpacity
                              key={m.id}
                              style={[styles.modeItem, regenMode === m.id && styles.modeItemSelected]}
                              onPress={() => setRegenMode(m.id as any)}>
                              {React.cloneElement(
                                m.icon as React.ReactElement,
                                {
                                  color:
                                    regenMode === m.id
                                      ? colors.background.dark
                                      : colors.text.secondary,
                                } as any
                              )}
                              <Text
                                style={[
                                  styles.modeItemText,
                                  regenMode === m.id && styles.modeItemTextSelected,
                                ]}>
                                {m.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </View>
                    </View>

                    <NeonButton
                      title="C'est parti"
                      onPress={() => {
                        generateContent(localQuery, regenMode);
                      }}
                      icon={<Sparkles size={20} color="#000" />}
                      size="lg"
                      variant="premium"
                    />
                  </View>
                )}
              </View>
            </>
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
    </GuidedScreenWrapper >
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
  /* --- SOCIAL POST STYLE --- */
  socialCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  socialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary.main}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary.main}40`,
  },
  socialUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  socialTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  socialImageSection: {
    width: '100%',
    backgroundColor: '#000',
  },
  socialCaptionSection: {
    padding: 16,
    paddingTop: 12,
  },
  socialCaptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#EEE',
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
    marginTop: 10,
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
  regenerateSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
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
  modeSelector: {
    marginVertical: 10,
    gap: 12,
  },
  modeLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeItemSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  modeItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  modeItemTextSelected: {
    color: colors.background.dark,
    fontWeight: '700',
  },
  jsonContainer: {
    gap: 16,
  },
  jsonField: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  jsonKey: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  jsonValue: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
  },
  jsonValueList: {
    gap: 6,
  },
  jsonValueListItem: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  jsonListItem: {
    marginBottom: 8,
  },
  jsonSubValue: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  jsonFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniCopyButton: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
  },
  jsonSubObjectCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  miniCopyButtonAbsolute: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  posterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  posterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
  },
  posterLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary.main,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  posterTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  posterSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  posterBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#DDD',
    textAlign: 'center',
    marginBottom: 24,
  },
  posterOfferCard: {
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary.main,
    marginBottom: 24,
  },
  posterOfferText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.main,
    textAlign: 'center',
  },
  posterInfo: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 20,
  },
  posterInfoText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  posterCta: {
    backgroundColor: colors.primary.main,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  posterCtaText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  posterSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
    width: '100%',
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: colors.background.premium,
    borderWidth: 1,
    borderColor: `${colors.primary.main}30`,
    overflow: 'hidden' as const,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${colors.primary.main}10`,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.primary.main}20`,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyerImage: {
    width: '100%',
    height: '100%',
  },
  imageSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 0,
  },
});
