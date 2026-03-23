import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
  Animated as RNAnimated,
  Easing,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useGlobalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Menu,
  Copy,
  Trash2,
  ArrowUpRight,
  Smartphone,
  FileText,
} from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuthStore } from '../../store/authStore';
import { useCreationStore, CreationCategory } from '../../store/creationStore';
import { useChatStore, Message, generateConversationId } from '../../store/chatStore';
import { AiService } from '../../api/ai.service';
import { api } from '../../api/client';
import { colors } from '../../theme/colors';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { MediaDisplay } from '../../components/MediaDisplay';
import { TypingMessage } from '../../components/TypingMessage';
import { PaymentBlocker } from '../../components/PaymentBlocker';
import { ChatInput } from '../../components/ChatInput';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const { width: SCREEN_W } = Dimensions.get('window');
const H_PADDING   = 20;
const COL_GAP     = 12;
const CARD_W      = (SCREEN_W - H_PADDING * 2 - COL_GAP) / 2;
const NEON_CARD_W = CARD_W;

const PACK_IMAGES: Record<string, any> = {
  curieux: require('../../assets/images/packs/packCurieux.png'),
  atelier: require('../../assets/images/packs/atelier.png'),
  studio:  require('../../assets/images/packs/studio.png'),
};

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
}

const getUniversalFunctions = (planType: string): JobFunction[] => {
  if (planType === 'studio') {
    return [
      { label: 'Réseaux sociaux',     category: 'Social',   icon: Smartphone },
      { label: 'Textes libres',        category: 'Social',   icon: FileText   },
      { label: 'Flyer / Affiche',      category: 'Document', icon: FileText   },
      { label: 'Format impression HD', category: 'Document', icon: FileText   },
    ];
  }
  return [
    { label: 'Contenu réseaux', category: 'Social',   icon: Smartphone },
    { label: 'Flyers',          category: 'Document', icon: FileText   },
  ];
};

// ── NeonBorderCard ────────────────────────────────────────────────────────────
function NeonBorderCard({
  children,
  isSelected,
  cardBg = '#030814',
}: {
  children: React.ReactNode;
  isSelected: boolean;
  cardBg?: string;
}) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loopRef    = useRef<RNAnimated.CompositeAnimation | null>(null);
const formatUserMessage = (text: string): string => {
  if (!text || text.trim().length === 0) return text;

  try {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed)) {
          const userMessages = parsed.filter((item: any) => item.role === 'user' || item.sender === 'user');
          if (userMessages.length > 0) {
            const lastUserMsg = userMessages[userMessages.length - 1];
            const content = lastUserMsg.content || lastUserMsg.text || lastUserMsg.message || '';
            if (content) return String(content);
          }
        } else {
          if (parsed.content) return String(parsed.content);
          if (parsed.query) return String(parsed.query);
          if (parsed.prompt) return String(parsed.prompt);

          return Object.values(parsed)
            .filter(v => typeof v === 'string' && v.trim().length > 0)
            .join(' - ');
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // Si c'est juste du texte sans JSON ou si erreur, on retourne tel quel sans emojis ou formatage complexe
  return text;
};

  useEffect(() => {
    loopRef.current?.stop();
    if (isSelected) {
      translateX.setValue(0);
      loopRef.current = RNAnimated.loop(
        RNAnimated.timing(translateX, {
          toValue: -NEON_CARD_W,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      );
      loopRef.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => { loopRef.current?.stop(); };
  }, [isSelected]);

  return (
    <View style={s.neonWrapper}>
      {isSelected && (
        <View style={s.neonClip} pointerEvents="none">
          <RNAnimated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['transparent', '#00eaff', '#1e9bff', 'transparent', 'transparent', '#00eaff', '#1e9bff', 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: NEON_CARD_W * 2, height: '100%' }}
            />
          </RNAnimated.View>
          <View style={[s.neonMask, { backgroundColor: cardBg }]} />
        </View>
      )}
      {isSelected && (
        <>
          <View style={s.bloomFar}  pointerEvents="none" />
          <View style={s.bloomMid}  pointerEvents="none" />
          <View style={s.floorGlow} pointerEvents="none" />
        </>
      )}
      {children}
    </View>
  );
}

// ── PackIcon ──────────────────────────────────────────────────────────────────
function PackIcon({ planType, size = 48, isSelected }: { planType: string; size?: number; isSelected: boolean }) {
  const source = PACK_IMAGES[planType] ?? PACK_IMAGES['curieux'];
  return (
    <View style={isSelected ? s.iconGlow : undefined}>
      <Image
        source={source}
        style={{ width: size, height: size, tintColor: isSelected ? '#00eaff' : colors.text.muted }}
        resizeMode="contain"
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { isHydrated, user } = useAuthStore();
  const router     = useRouter();
  const { chatId, conversationId: paramConversationId, reset } = useGlobalSearchParams();
  const idToLoad   = (paramConversationId ?? chatId) as string | undefined;
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets     = useSafeAreaInsets();

  const [inputValue, setInputValue]               = useState('');
  const { messages, setMessages, conversationId, setConversationId, resetChat: clearChatStore } = useChatStore();
  const { setFunction, selectedFunction, setJob }  = useCreationStore();
  const resetCreationStore = useCreationStore((state) => state.reset);
  const [isGenerating, setIsGenerating]           = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [selectedImage, setSelectedImage]         = useState<string | null>(null);
  const [plans, setPlans]                         = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans]           = useState(false);
  const [modalVisible, setModalVisible]           = useState(false);
  const [modalType, setModalType]                 = useState<ModalType>('info');
  const [modalTitle, setModalTitle]               = useState('');
  const [modalMessage, setModalMessage]           = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading]   = useState(false);
  const { initPaymentSheet, presentPaymentSheet }  = useStripe();
  const [hasAutoOpenedStripe, setHasAutoOpenedStripe] = useState(false);
  const [recording, setRecording]                 = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission]   = Audio.usePermissions();

  useEffect(() => { fetchPlans(); }, []);
  useEffect(() => {
    if (user?.isFirstTime === true) useAuthStore.getState().setFirstTimeUsed();
  }, [user?.isFirstTime]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const resp = await api.get('/ai/payment/plans');
      const backendPlans = resp.data?.data ?? resp.data ?? [];
      setPlans(backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€ / mois` : p.price,
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal('error', 'Permission refusée', "Veuillez autoriser l'accès à la galerie pour sélectionner une photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
      if (!result.canceled) setSelectedImage(result.assets[0].uri);
    } catch (error) {
      console.error('Error picking image:', error);
      showModal('error', 'Erreur', "Impossible de sélectionner l'image.");
    }
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        const resp = await requestPermission();
        if (resp.status !== 'granted') {
          showModal('error', 'Permission refusée', "Veuillez autoriser l'accès au micro pour utiliser la dictée vocale.");
          return;
        }
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      showModal('error', 'Erreur', "Impossible de démarrer l'enregistrement.");
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setRecording(null);
    setIsGenerating(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No URI');
      const formData = new FormData();
      formData.append('file', { uri, name: 'audio.m4a', type: 'audio/m4a' } as any);
      const response = await api.post('/ai/transcribe', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data?.text) setInputValue(prev => prev ? prev + ' ' + response.data.text : response.data.text);
    } catch (err) {
      console.error('Transcription error', err);
      showModal('error', 'Erreur', "Impossible de transcrire l'audio.");
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Plan / subscription state (restauré depuis l'ancien code) ────────────
  const planType             = user?.planType || 'curieux';
  const subStatus            = user?.subscriptionStatus;
  const stripeId             = user?.stripeCustomerId;
  const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
  const isPackCurieux        = planType === 'curieux';

  const now     = new Date();
  const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const isExpired = endDate && now > endDate;

  const effectivePlanId   = isPackCurieux && isExpired ? 'studio' : planType;
  const fallbackPlan      = { id: 'curieux', name: 'Pack Curieux', price: 'Gratuit (7 jours)' };
  const currentPlanObject = plans.find(p => p.id === effectivePlanId) || plans.find(p => p.id === 'atelier') || fallbackPlan;

  const promptsLimit = user?.promptsLimit || 0; const promptsUsed = user?.promptsUsed || 0;
  const imagesLimit  = user?.imagesLimit  || 0; const imagesUsed  = user?.imagesUsed  || 0;
  const videosLimit  = user?.videosLimit  || 0; const videosUsed  = user?.videosUsed  || 0;
  const audioLimit   = user?.audioLimit   || 0; const audioUsed   = user?.audioUsed   || 0;
  const threeDLimit  = user?.threeDLimit  || 0; const threeDUsed  = user?.threeDUsed  || 0;

  const textRemaining   = Math.max(0, promptsLimit - promptsUsed);
  const imagesRemaining = Math.max(0, imagesLimit  - imagesUsed);

  const isTextExhausted   = promptsLimit > 0 && promptsLimit !== 999999 && promptsUsed >= promptsLimit;
  const isImagesExhausted = imagesLimit  > 0 && imagesLimit  !== 999999 && imagesUsed  >= imagesLimit;
  const isVideosExhausted = videosLimit  > 0 && videosLimit  !== 999999 && videosUsed  >= videosLimit;
  const isAudioExhausted  = audioLimit   > 0 && audioLimit   !== 999999 && audioUsed   >= audioLimit;
  const isThreeDExhausted = threeDLimit  > 0 && threeDLimit  !== 999999 && threeDUsed  >= threeDLimit;
  const isFullyExhausted  = isTextExhausted && isImagesExhausted && isVideosExhausted && isAudioExhausted && isThreeDExhausted;

  const isTrialButNoCard      = isPackCurieux && (!user?.isStripeVerified || !user?.stripeCustomerId);
  const isAnyMessageTyping    = messages.some(m => m.isTyping);
  const isPaidPlanButInactive = isHydrated && (!isSubscriptionActive || isTrialButNoCard || (isPackCurieux && isExpired) || isFullyExhausted);

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type); setModalTitle(title); setModalMessage(message); setModalVisible(true);
  };

  const hasFeatureAccess = (feature: 'text' | 'image' | 'audio' | 'video' | '3d'): boolean => {
    const accessMatrix: Record<string, string[]> = {
      text:  ['curieux', 'atelier', 'studio', 'agence'],
      image: ['curieux', 'atelier', 'studio', 'agence'],
      audio: ['studio', 'agence'],
      video: ['studio', 'agence'],
      '3d':  ['agence'],
    };
    return accessMatrix[feature]?.includes(planType) || false;
  };

  const checkFeatureAccess = (feature: 'text' | 'image' | 'audio' | 'video' | '3d'): boolean => {
    if (hasFeatureAccess(feature)) return true;
    const requiredPlans: Record<string, string> = { audio: 'Studio', video: 'Studio', '3d': 'Agence' };
    const featureNames: Record<string, string>  = {
      text: 'Génération de texte', image: "Génération d'images",
      audio: 'Génération audio', video: 'Génération vidéo', '3d': 'Génération 3D',
    };
    showModal('warning', 'Fonctionnalité non disponible',
      `${featureNames[feature]} n'est disponible qu'à partir du pack ${requiredPlans[feature]}. Passez à un plan supérieur pour y accéder.`);
    return false;
  };

  const handleStripePayment = async () => {
    const planConfig = plans.find(p => p.id === planType);
    if (!planConfig && planType !== 'curieux') return;
    setIsPaymentLoading(true);
    try {
      const isCurieux = planType === 'curieux';
      const payload   = { priceId: !isCurieux ? planConfig?.stripePriceId : undefined, planId: planType, userId: user?.id };
      const resp      = await api.post('/ai/payment/create-payment-sheet', payload);
      const data      = resp.data?.data ?? resp.data ?? resp;
      const paymentIntentClientSecret = data.paymentIntentClientSecret || (!data.setupIntentClientSecret ? (data.clientSecret || data.paymentIntent?.client_secret) : undefined);
      const setupIntentClientSecret = data.setupIntentClientSecret;
      const customerEphemeralKey = data.ephemeralKey || data.customer_ephemeral_key;
      const customerId = data.customerId || data.customer || data.customer_id;
      const subscriptionId = data.subscriptionId;

      if (!paymentIntentClientSecret && !setupIntentClientSecret) {
        throw new Error('Impossible de récupérer le client secret.');
      }

      const initResult = await initPaymentSheet({
        paymentIntentClientSecret,
        setupIntentClientSecret,
        merchantDisplayName: 'Hipster IA',
        customerEphemeralKeySecret: customerEphemeralKey,
        customerId,
        locale: 'fr-FR',
      });

      if (initResult.error) throw initResult.error;
      const presentResult = await presentPaymentSheet();
      if (presentResult.error) {
        const errorMsg = presentResult.error.message?.includes('payment flow has been cancelled')
          ? 'Le paiement a été annulé.'
          : (presentResult.error.message || 'Erreur lors du paiement');
        showModal('error', 'Paiement échoué', errorMsg);
        return;
      }

      // Success
      await api.post('/ai/payment/confirm-plan', {
        planId: currentPlanObject?.id,
        paymentIntentId: data.paymentIntent?.id,
      });

      setIsPaymentLoading(false);
      await useAuthStore.getState().updateAiProfile({ isStripeVerified: true, subscriptionStatus: (planType === 'curieux' ? 'trial' : 'active') as any, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId });
      await useAuthStore.getState().aiRefreshUser();
      showModal('success', 'Félicitations !', 'Votre abonnement est maintenant actif.');
    } catch (e: any) {
      console.error('Stripe error:', e);
      showModal('error', 'Erreur', e?.message || 'Une erreur est survenue lors du paiement.');
    } finally { setIsPaymentLoading(false); }
  };

  useEffect(() => {
    const isPackCurieux = user?.planType === 'curieux';
    const hasNoStripe   = !user?.stripeCustomerId;
    if (isHydrated && isPackCurieux && hasNoStripe && !hasAutoOpenedStripe && !isPaymentLoading && !isLoadingConversation) {
      console.log('[HomeScreen] Auto-triggering Stripe Payment Sheet for Pack Curieux...');
      setHasAutoOpenedStripe(true);
      const timer = setTimeout(() => handleStripePayment(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, user?.planType, user?.stripeCustomerId, hasAutoOpenedStripe, isPaymentLoading, isLoadingConversation]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get('/ai/ping').catch(() => null);
        setIsBackendConnected(!!response);
        if (!response) console.warn('[DEBUG] Backend unreachable at', api.defaults.baseURL);
      } catch (e) { setIsBackendConnected(false); }
    };
    checkConnection();
    useAuthStore.getState().aiRefreshUser().then(() => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.job) setJob(currentUser.job);
    }).catch(console.error);
    const requestInitialPermissions = async () => {
      try {
        await MediaLibrary.requestPermissionsAsync();
        await Notifications.requestPermissionsAsync();
        await Audio.requestPermissionsAsync();
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250], lightColor: '#FF231F7C' });
        }
      } catch (e) { console.warn('Error requesting permissions:', e); }
    };
    requestInitialPermissions();
    const refreshInterval = setInterval(() => {
      console.log('[HomeScreen] Real-time profile refresh...');
      useAuthStore.getState().aiRefreshUser().catch(console.error);
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (reset === 'true') { resetChat(); router.setParams({ reset: undefined }); }
  }, [reset]);

  useEffect(() => {
    const formatStructuredData = (data: any): string => {
      if (typeof data !== 'object' || data === null) return JSON.stringify(data);

      const lines: string[] = [];
      const indent = (text: string, level: number = 0) => '  '.repeat(level) + text;
      const processedKeys = new Set<string>();

      // Title/Primary heading
      const primaryTitle = data.title || data.name || data.heading || null;
      if (primaryTitle) {
        processedKeys.add('title');
        processedKeys.add('name');
        processedKeys.add('heading');
        lines.push('');
        lines.push(indent('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 0));
        lines.push(indent(`📌 ${primaryTitle.toUpperCase()}`, 0));
        lines.push(indent('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 0));
        lines.push('');
      }

      // Description or content
      if (data.description) {
        processedKeys.add('description');
        lines.push(indent(data.description, 0));
        lines.push('');
      }
      if (data.content && !data.description) {
        processedKeys.add('content');
        lines.push(indent(data.content, 0));
        lines.push('');
      }
      if (data.text && !data.description && !data.content) {
        processedKeys.add('text');
        lines.push(indent(data.text, 0));
        lines.push('');
      }

      // Subtitle
      if (data.subtitle) {
        processedKeys.add('subtitle');
        lines.push(indent(`📍 ${data.subtitle}`, 0));
        lines.push('');
      }

      // Sections array
      if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
        processedKeys.add('sections');
        lines.push(indent('📋 SECTIONS', 0));
        lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
        data.sections.forEach((section: any, idx: number) => {
          if (typeof section === 'string') {
            lines.push(indent(`${String(idx + 1).padStart(2, '0')}. ${section}`, 1));
          } else if (section.title) {
            lines.push(indent(`\n▸ ${section.title}`, 1));
            if (section.content) {
              lines.push(indent(section.content, 2));
            }
            if (section.description && !section.content) {
              lines.push(indent(section.description, 2));
            }
          }
        });
        lines.push('');
      }

      // Color scheme
      if (data.colorScheme || data.colors) {
        processedKeys.add('colorScheme');
        processedKeys.add('colors');
        const colors = data.colorScheme || data.colors;
        lines.push(indent('🎨 PALETTE COULEURS', 0));
        lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
        if (typeof colors === 'object') {
          Object.entries(colors).forEach(([key, value]: any) => {
            lines.push(indent(`  ${key}: ${value}`, 1));
          });
        } else {
          lines.push(indent(colors, 1));
        }
        lines.push('');
      }

      // Keywords/Tags
      if (data.keywords && Array.isArray(data.keywords)) {
        processedKeys.add('keywords');
        lines.push(indent('🏷️  MOT-CLÉS', 0));
        lines.push(indent(data.keywords.map((k: string) => `#${k}`).join('  '), 1));
        lines.push('');
      }

      // Hashtags
      if (data.hashtags && Array.isArray(data.hashtags)) {
        processedKeys.add('hashtags');
        lines.push(indent('#️⃣ HASHTAGS', 0));
        const tags = data.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join('  ');
        lines.push(indent(tags, 1));
        lines.push('');
      }

      // Features/Points list
      if (data.features && Array.isArray(data.features) && data.features.length > 0) {
        processedKeys.add('features');
        lines.push(indent('✨ CARACTÉRISTIQUES', 0));
        lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
        data.features.forEach((feature: any) => {
          const featureText = typeof feature === 'string' ? feature : feature.text || feature.name || feature.description || '';
          if (featureText) {
            lines.push(indent(`✓ ${featureText}`, 1));
          }
        });
        lines.push('');
      }

      // Benefits
      if (data.benefits && Array.isArray(data.benefits)) {
        processedKeys.add('benefits');
        lines.push(indent('💡 AVANTAGES', 0));
        lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
        data.benefits.forEach((benefit: any) => {
          const text = typeof benefit === 'string' ? benefit : benefit.text || benefit.description || '';
          if (text) lines.push(indent(`→ ${text}`, 1));
        });
        lines.push('');
      }

      // Meta info (for social, etc)
      if (data.meta) {
        processedKeys.add('meta');
        lines.push(indent('ℹ️  INFORMATIONS', 0));
        lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
        Object.entries(data.meta).forEach(([key, value]: any) => {
          lines.push(indent(`${key}: ${value}`, 1));
        });
        lines.push('');
      }

      // Call to action
      if (data.cta || data.callToAction) {
        processedKeys.add('cta');
        processedKeys.add('callToAction');
        const cta = data.cta || data.callToAction;
        const ctaText = typeof cta === 'string' ? cta : cta.text || cta.label || '';
        if (ctaText) {
          lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
          lines.push(indent(`🎯 ${ctaText}`, 0));
        }
      }

      // Display any remaining fields not yet processed
      const remainingKeys = Object.keys(data).filter(k => !processedKeys.has(k) && data[k] !== null && data[k] !== undefined);
      if (remainingKeys.length > 0) {
        lines.push('');
        lines.push(indent('📝 AUTRES INFORMATIONS', 0));
        lines.push(indent('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─', 0));
        remainingKeys.forEach(key => {
          const value = data[key];
          let displayValue = '';
          if (typeof value === 'string') {
            displayValue = value;
          } else if (Array.isArray(value)) {
            displayValue = value.join(', ');
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value, null, 2);
          } else {
            displayValue = String(value);
          }
          lines.push(indent(`${key}: ${displayValue}`, 1));
        });
      }

      const filtered = lines.filter(line => line.trim() !== '');
      return filtered.length > 0 ? filtered.join('\n') : JSON.stringify(data, null, 2);
    };

    const loadConversation = async () => {
      if (idToLoad) {
        setIsLoadingConversation(true);
        try {
          console.log('[DEBUG] Loading conversation:', idToLoad);
          const conversation = await AiService.getConversation(idToLoad);

          if (conversation) {
            console.log(conversation);

            // Set the conversation ID for subsequent messages
            setConversationId(idToLoad);

            // Check if this is a non-CHAT generation (Flyer, Social, Image, etc)
            const isNonChatGeneration = conversation.type && conversation.type !== 'CHAT';
            const uiMessages: Message[] = [];

            if (isNonChatGeneration) {
              // For Flyer, Social, Image, etc: show the original prompt and result with image
              if (conversation.prompt) {
                uiMessages.push({
                  id: `${idToLoad}-user`,
                  text: formatUserMessage(conversation.prompt), // Use formatUserMessage here
                  sender: 'user',
                  timestamp: new Date(conversation.createdAt),
                  isTyping: false,
                });
              }

              // Add the result with the image - format structured data nicely
              if (conversation.result || conversation.imageUrl) {
                let resultText = conversation.result || 'Génération complétée';
                console.log('[DEBUG] Raw result:', resultText);

                // Try to parse and format JSON result
                if (resultText && resultText !== 'Génération complétée') {
                  try {
                    let textToParse = resultText;

                    // Handle different JSON formats
                    if (typeof textToParse === 'string') {
                      textToParse = textToParse
                        .trim()
                        .replace(/^```json\n?/, '')
                        .replace(/^```\n?/, '')
                        .replace(/\n?```$/, '')
                        .trim();

                      console.log('[DEBUG] Text to parse:', textToParse.substring(0, 100));

                      const parsed = JSON.parse(textToParse);
                      const formatted = formatStructuredData(parsed);
                      console.log('[DEBUG] Formatted result length:', formatted.length);

                      if (formatted && formatted.length > 0) {
                        resultText = formatted;
                      }
                    }
                  } catch (e) {
                    console.warn('[DEBUG] Parse error:', e, 'Original:', resultText.substring(0, 100));
                    // Not JSON, use as-is
                  }
                }

                console.log('[DEBUG] Final resultText:', resultText.substring(0, 100));

                // Determine media type based on generation type
                let mediaType: 'image' | 'text' = 'image';
                if (conversation.type === 'SOCIAL' || conversation.type === 'TEXT') {
                  mediaType = 'text';
                }

                uiMessages.push({
                  id: `${idToLoad}-result`,
                  text: resultText,
                  sender: 'ai',
                  timestamp: new Date(conversation.createdAt),
                  isTyping: false,
                  type: conversation.imageUrl ? mediaType : 'text',
                  mediaUrl: conversation.imageUrl || undefined,
                });
              }
            } else {
              // CHAT type: regular conversation loading
              // Parse the stored conversation history
              let storedMessages: any[] = [];
              let isOldFormat = false;

              try {
                // Try to parse as JSON (new format)
                const parsed = JSON.parse(conversation.prompt);
                if (Array.isArray(parsed)) {
                  storedMessages = parsed;
                } else {
                  // Not an array, treat as old format
                  isOldFormat = true;
                }
              } catch (e) {
                // Not valid JSON, it's old format (plain text)
                isOldFormat = true;
                console.log('[DEBUG] Old conversation format detected');
              }

              if (isOldFormat) {
                // Old format: just show the prompt and result
                if (conversation.prompt) {
                  uiMessages.push({
                    id: `${idToLoad}-user`,
                    text: formatUserMessage(conversation.prompt), // Use formatUserMessage here
                    sender: 'user',
                    timestamp: new Date(conversation.createdAt),
                    isTyping: false,
                  });
                }
                if (conversation.result) {
                  uiMessages.push({
                    id: `${idToLoad}-ai`,
                    text: conversation.result,
                    sender: 'ai',
                    timestamp: new Date(conversation.createdAt),
                    isTyping: false,
                  });
                }
              } else {
                // New format: convert stored messages to UI format
                storedMessages.forEach((msg, index) => {
                  if (msg.role === 'user' || msg.role === 'assistant') {
                    const uiMsg: Message = {
                      id: `${idToLoad}-${index}`,
                      text: msg.role === 'user' ? formatUserMessage(msg.content) : msg.content, // Use formatUserMessage for user content
                      sender: (msg.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                      timestamp: new Date(),
                      isTyping: false,
                      type: msg.type || 'text',
                      mediaUrl: msg.url || msg.mediaUrl,
                    };
                    uiMessages.push(uiMsg);
                  }
                });

                // Add the final AI response if it's not already in the messages
                if (conversation.result) {
                  // Check if the last message is already the result
                  const lastMsg = uiMessages[uiMessages.length - 1];
                  const resultMatches = lastMsg && lastMsg.sender === 'ai' && lastMsg.text === conversation.result;

                  if (!resultMatches) {
                    // Add the result as a new AI message
                    uiMessages.push({
                      id: `${idToLoad}-result`,
                      text: conversation.result,
                      sender: 'ai',
                      timestamp: new Date(),
                      isTyping: false,
                    });
                  }
                }
              }
            }

            setMessages(uiMessages);
          }
        } catch (error) {
          console.error('[DEBUG] Failed to load conversation:', error);
        } finally {
          setIsLoadingConversation(false);
        }
      }
    };
    loadConversation();
  }, [idToLoad]);

  const placeholderText = "Décrivez votre idée, ajoutez une image ou un audio...";
  const hasMessages     = messages.length > 0;
  const isInputDisabled = isGenerating || isFullyExhausted || isAnyMessageTyping;

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getEmojiForKey = (key: string): string => {
    const k = key.toLowerCase();
    if (k.includes('title') || k.includes('heading') || k.includes('name')) return '📌';
    if (k.includes('description') || k.includes('content') || k.includes('text')) return '📝';
    if (k.includes('color') || k.includes('style') || k.includes('design')) return '🎨';
    if (k.includes('feature') || k.includes('benefit')) return '✨';
    if (k.includes('price') || k.includes('cost')) return '💰';
    if (k.includes('image') || k.includes('url') || k.includes('media')) return '📸';
    if (k.includes('hashtag') || k.includes('tag') || k.includes('keyword')) return '#️⃣';
    if (k.includes('cta') || k.includes('action') || k.includes('button')) return '🎯';
    return '•';
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isGenerating) return;
    if (isTextExhausted) { showModal('error', 'Limite atteinte', "Vous avez atteint votre limite d'utilisation. Vous pouvez encore générer des images ou passer à un pack supérieur !"); return; }
    const currentImage = selectedImage;

    // Check credits
    if (isTextExhausted) {
      showModal('error', 'Limite atteinte', `Vous avez atteint votre limite d'utilisation. Vous pouvez encore générer des images ou passer à un pack supérieur !`);
      return;
    }

    const formattedText = formatUserMessage(inputValue.trim());

    const userMsg: Message = {
      id: Date.now().toString(),
      text: formattedText,
      sender: 'user',
      timestamp: new Date(),
      type: currentImage ? 'image' : 'text',
      mediaUrl: currentImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setSelectedImage(null);
    setIsGenerating(true);

    try {
      const chatHistory: any[] = [];
      const systemContext = `\n      Identité: Hipster IA\n      Rôle: Assistant créatif et intelligent\n      Cible: ${user?.email?.split('@')[0] || "l'utilisateur"}\n      Contexte: ${user?.type !== 'ai' && user?.job ? `Métier: ${user.job}` : ''}\n    `;
      chatHistory.push({ role: 'system', content: `Tu es Hipster IA. ${systemContext}. IMPORTANT: Ne jamais utiliser d'emojis dans tes réponses. Garde un ton professionnel et direct.` });
      messages.forEach(m => chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      chatHistory.push({ role: 'user', content: userMsg.text });
      const convIdToSend = conversationId || generateConversationId();
      if (!conversationId) setConversationId(convIdToSend);
      console.log('[DEBUG] Free Mode Chat History:', JSON.stringify(chatHistory, null, 2));
      console.log('[DEBUG] Conversation ID:', convIdToSend);
      let response;
      if (currentImage) {
        const formData = new FormData();
        formData.append('messages', JSON.stringify(chatHistory));
        formData.append('conversationId', convIdToSend);
        const filename = currentImage.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        formData.append('file', { uri: currentImage, name: filename, type: `image/${ext}` } as any);
        const res = await api.post('/ai/chat', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        response = res.data.data;
      } else {
        response = await AiService.chat(chatHistory, convIdToSend);
      }
      console.log('[DEBUG] Response:', JSON.stringify(response, null, 2));
      if (!conversationId && response.conversationId) setConversationId(response.conversationId);
      const content = response.data?.content ?? response.content ?? response.message ?? response;
      let mediaUrl: string | undefined;
      const isImageAsync = response.type === 'image' && !response.imageBase64 && !response.mediaUrl && response.generationId;
      console.log('[DEBUG] Free Mode - isImageAsync:', isImageAsync, 'generationId:', response.generationId);
      if (isImageAsync) {
        console.log('[DEBUG] ⏳ Starting Free Mode polling with generationId:', response.generationId);
        let isCompleted = false, attempts = 0;
        while (!isCompleted && attempts < 30) {
          attempts++;
          console.log(`[DEBUG] 🔄 Free Mode Poll attempt ${attempts}/30`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            const updatedGen = await AiService.getConversation(response.generationId.toString());
            console.log('[DEBUG] Free Mode Poll response:', JSON.stringify(updatedGen, null, 2));
            const imageUrl = updatedGen?.imageUrl || updatedGen?.url || updatedGen?.image;
            if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) { mediaUrl = imageUrl; isCompleted = true; }
            else if (updatedGen?.result?.startsWith('ERROR')) throw new Error(updatedGen.result);
          } catch (pollError) { console.warn('[DEBUG] ⚠️ Free Mode poll error on attempt', attempts, ':', pollError); }
        }
        if (!isCompleted) { console.error('[DEBUG] ❌ Free Mode polling timed out'); throw new Error('Image generation timed out'); }
      } else if (response.type === 'image' && response.imageBase64) {
        mediaUrl = `data:image/png;base64,${response.imageBase64}`;
      } else { mediaUrl = response.mediaUrl; }
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: typeof content === 'string' ? content : JSON.stringify(content), sender: 'ai', timestamp: new Date(), isTyping: !!(typeof content === 'string' && content.length > 0), type: response.type || 'text', mediaUrl };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('[DEBUG] Free Mode Error:', error);
      showModal('error', 'Erreur de génération', error?.response?.data?.message || error.message || 'Erreur inconnue');
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Désolé, une erreur est survenue lors de la génération.', sender: 'ai', timestamp: new Date(), isTyping: true }]);
    } finally {
      setIsGenerating(false);
      useAuthStore.getState().aiRefreshUser().catch(console.error);
    }
  };

  const copyToClipboard = (text: string) => {};

  const handleDeleteConfirm = async () => {
    console.log('[HomeScreen] handleDeleteConfirm triggered. conversationId:', conversationId);
    setShowDeleteConfirm(false);
    if (!conversationId) { console.warn('[HomeScreen] No conversationId to delete, just resetting local state.'); resetChat(); return; }
    try {
      setIsGenerating(true);
      const result = await AiService.deleteGeneration(conversationId);
      console.log('[HomeScreen] Deletion result from API:', result);
      resetChat();
      router.setParams({ chatId: undefined, conversationId: undefined });
      showModal('success', 'Succès', 'Conversation supprimée avec succès.');
    } catch (error) {
      console.error('[HomeScreen] Delete conversation error:', error);
      showModal('error', 'Erreur', 'Impossible de supprimer la conversation.');
    } finally { setIsGenerating(false); }
  };

  const resetChat = () => {
    clearChatStore(); setInputValue(''); setConversationId(null); resetCreationStore();
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.job) setJob(currentUser.job);
    console.log('[DEBUG] Starting new conversation');
  };

  const completeTyping = (msgId: string) => setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, isTyping: false } : msg));

  const fns = getUniversalFunctions(planType);

  return (
    <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={2}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={[s.topBar, { paddingTop: insets.top + 10 }]}>
            {!isPaidPlanButInactive && (
              <TouchableOpacity style={s.menuBtn} onPress={() => navigation.openDrawer()}>
                <Menu size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            {hasMessages ? (
              <TouchableOpacity
                onPress={() => { resetCreationStore(); if (user?.job) useCreationStore.getState().setJob(user.job); router.push('/(guided)/step2-type'); }}
                style={s.guidedBtn} activeOpacity={0.7}
              >
                <ArrowUpRight size={14} color={colors.primary.main} />
                <Text style={s.guidedBtnText}>Mode Guidé</Text>
              </TouchableOpacity>
            ) : <View /> }
            <View style={s.topRight}>
              {hasMessages && (
                <TouchableOpacity style={s.menuBtn} onPress={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={20} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!hasMessages ? (
              <>
                <View style={s.titleBlock}>
                  <Text style={s.greeting}>{getGreetingByTime()}</Text>
                  <Text style={s.titleArimo}>Que souhaitez-vous</Text>
                  <Text style={s.titleBrittany}>produire ?</Text>
                  {user?.job && (
                    <View style={s.jobRow}>
                      <Text style={s.jobLabel}>{user.job}</Text>
                    </View>
                  )}
                </View>

                <View style={s.grid}>
                  {fns.map((fn, index) => {
                    const isSelected = selectedFunction === fn.label;
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.9}
                        style={s.gridItem}
                        onPress={() => {
                          setFunction(fn.label, fn.category);
                          setTimeout(() => {
                            if (fn.category === 'Document') router.push('/(guided)/step3-directions');
                            else router.push('/(guided)/step4-personalize');
                          }, 300);
                        }}
                      >
                        <NeonBorderCard isSelected={isSelected}>
                          <View style={[s.card, isSelected && s.cardSelected]}>
                            <View style={[s.iconBox, isSelected && s.iconBoxActive]}>
                              <PackIcon planType={planType} size={44} isSelected={isSelected} />
                            </View>
                            <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]} numberOfLines={2}>
                              {fn.label}
                            </Text>
                          </View>
                        </NeonBorderCard>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={s.divider}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerText}>OU MODE LIBRE</Text>
                  <View style={s.dividerLine} />
                </View>
              </>
            ) : (
              <View style={s.messagesBlock}>
                {isLoadingConversation ? (
                  <View style={s.loadingBlock}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={s.loadingText}>Chargement de la conversation...</Text>
                  </View>
                ) : (
                  <>
                    {messages.map(msg => (
                      <View
                        key={msg.id}
                        style={[
                          s.bubble,
                          msg.sender === 'user' ? s.bubbleUser : s.bubbleAi,
                        ]}
                      >
                        {msg.type && msg.type !== 'text' && msg.mediaUrl && (
                          <MediaDisplay type={msg.type} url={msg.mediaUrl} showModal={showModal} />
                        )}

                        {msg.sender === 'user' ? (
                          msg.text ? (
                            <View>
                              {msg.text.split('\n').map((line, idx) => (
                                <Text key={idx} className="text-base text-slate-300">
                                  {line}
                                </Text>
                              ))}
                            </View>
                          ) : null
                        ) : msg.isTyping ? (
                          <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} />
                        ) : (
                          msg.text ? (
                            <View>
                              {msg.text.split('\n').map((line, idx) => (
                                <Text key={idx} className="text-base leading-6 text-slate-300">
                                  {line}
                                </Text>
                              ))}
                            </View>
                          ) : null
                        )}

                        {msg.sender === 'ai' && !msg.isTyping && (!msg.type || msg.type === 'text') && msg.text && (
                          <TouchableOpacity onPress={() => copyToClipboard(msg.text)} style={s.copyBtn}>
                            <Copy size={14} color={colors.text.muted} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </>
                )}
                {isGenerating && (
                  <View style={s.generatingDot}>
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  </View>
                )}
              </View>
            )}
            <View style={{ height: 128 }} />
          </ScrollView>

          <View
            className="px-5 pb-3 "
            style={{
              paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 12,
            }}
          >
            {/* Limit warnings */}
            {isPackCurieux && (
              <View className="mb-3 px-1">
                {/* Credits visible at top header */}
              </View>
            )}

            {isPaidPlanButInactive ? (
              <View className="h-20" /> // Placeholder to keep layout stable
            ) : (
              /*
              <ChatInput
                inputValue={inputValue}
                onChangeText={setInputValue}
                selectedImage={selectedImage}
                onImageSelect={pickImage}
                onImageRemove={() => setSelectedImage(null)}
                onSend={handleSend}
                isGenerating={isGenerating}
                isDisabled={isInputDisabled}
                placeholderText={placeholderText}
                maxLength={500}
              />
              */
              null
            )}
          </View>
        </KeyboardAvoidingView>

        {/* Freezing Overlay when payment is required */}
        {isPaidPlanButInactive && (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
            pointerEvents="box-none"
          >
            {/* Dark semi-transparent background */}
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
              pointerEvents="auto"
            />

            {/* Accessible Drawer Button on top of overlay */}
            <View
              style={{
                position: 'absolute',
                top: insets.top + 10,
                left: 20,
                zIndex: 1001
              }}
            >
              <TouchableOpacity
                className="rounded-lg bg-white/10 p-2"
                onPress={() => navigation.openDrawer()}>
                <Menu size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Blocker on top at the bottom */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 20,
                paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 20
              }}
              pointerEvents="box-none"
            >
              <PaymentBlocker
                plan={currentPlanObject}
                onPay={handleStripePayment}
                loading={isPaymentLoading}
              />
            </View>
          </View>
        )}
      </View>

      <GenericModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} />
      <GenericModal
        visible={showDeleteConfirm}
        type="warning"
        title="Supprimer la conversation"
        message="Voulez-vous vraiment supprimer définitivement cette discussion ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </BackgroundGradientOnboarding>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  menuBtn:       { borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', padding: 8 },
  topRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guidedBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary.main + '1f', borderWidth: 1, borderColor: colors.primary.main + '4d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  guidedBtnText: { color: colors.primary.main, fontSize: 12, fontWeight: '700', fontFamily: 'Arimo-Bold' },

  scroll:        { flex: 1, paddingHorizontal: H_PADDING },
  scrollContent: { flexGrow: 1, paddingTop: 40 },

  // ── Titre ──
  titleBlock:    { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  greeting:      { fontFamily: 'Arimo-Regular', fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textAlign: 'center' },
  titleArimo:    { fontFamily: 'Arimo-Bold', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  titleBrittany: { fontFamily: 'Brittany-Signature', fontSize: 38, color: '#ffffff', textAlign: 'center', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18, includeFontPadding: false, lineHeight: 48 },
  jobRow:        { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  jobLabel:      { fontFamily: 'Arimo-Bold', fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase' },

  // ── Grille 2 colonnes ──
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP, marginBottom: 8 },
  gridItem: { width: CARD_W },

  // ── Card carrée ──
  card: {
    width: CARD_W,
    aspectRatio: 1,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 3,
  },
  cardSelected:      { backgroundColor: '#030814', borderWidth: 0 },
  iconBox:           { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  iconBoxActive:     { backgroundColor: 'rgba(30,155,255,0.15)', borderWidth: 1, borderColor: 'rgba(30,155,255,0.4)' },
  iconGlow:          { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  cardLabel:         { fontFamily: 'Arimo-Bold', fontSize: 13, color: colors.text.secondary, textAlign: 'center' },
  cardLabelSelected: { color: '#ffffff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },

  // ── NeonBorderCard ──
  neonWrapper: { position: 'relative', marginBottom: 2 },
  neonClip:    { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 21, overflow: 'hidden', zIndex: 2 },
  neonTrack:   { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask:    { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 20, zIndex: 1 },
  bloomMid:    { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 24, backgroundColor: 'transparent', shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 8 },
  bloomFar:    { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 28, backgroundColor: 'transparent', shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 28, elevation: 4 },
  floorGlow:   { position: 'absolute', bottom: -16, alignSelf: 'center', width: '80%', height: 24, borderRadius: 50, backgroundColor: 'transparent', shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },

  // ── Divider ──
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 20, opacity: 0.4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontFamily: 'Arimo-Bold', fontSize: 11, letterSpacing: 2, color: '#64748b' },

  // ── Messages ──
  messagesBlock: { gap: 12, paddingTop: 20 },
  loadingBlock:  { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText:   { marginTop: 16, color: '#94a3b8', fontFamily: 'Arimo-Regular' },
  bubble:        { maxWidth: '85%', borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8 },
  bubbleUser:    { backgroundColor: colors.primary.main + '33', borderColor: colors.primary.main + '66', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAi:      { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.15)' },
  bubbleText:    { fontSize: 15, lineHeight: 24, color: '#cbd5e1', fontFamily: 'Arimo-Regular' },
  copyBtn:       { marginTop: 8, alignSelf: 'flex-end', padding: 4 },
  generatingDot: { width: 56, height: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16 },

  inputWrapper: { paddingHorizontal: 20, paddingTop: 4 },
});