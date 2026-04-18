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
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
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
import { fonts } from '../../theme/typography';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { MediaDisplay } from '../../components/MediaDisplay';
import { TypingMessage } from '../../components/TypingMessage';
import { PaymentBlocker } from '../../components/PaymentBlocker';

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

const NEON_BLUE  = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;

const PACK_IMAGES: Record<string, any> = {
  curieux: require('../../assets/images/packs/packCurieux.png'),
  atelier: require('../../assets/images/packs/atelier.png'),
  studio:  require('../../assets/images/packs/studio.png'),
};

const JOB_IMAGES: Record<string, any> = {
  'Réseaux sociaux':     require('../../assets/images/jobs/reseaux.png'),
  'Textes libres':       require('../../assets/images/jobs/texte.png'),
  'Flyer / Affiche':     require('../../assets/images/jobs/flyer.png'),
  'Impression HD': require('../../assets/images/jobs/impression.png'),
};

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
  image?: any;
}

const getUniversalFunctions = (planType: string): JobFunction[] => {
  if (planType === 'studio') {
    return [
      { label: 'Réseaux sociaux',      category: 'Social',   icon: Smartphone, image: JOB_IMAGES['Réseaux sociaux'] },
      { label: 'Textes libres',         category: 'Social',   icon: FileText,   image: JOB_IMAGES['Textes libres'] },
      { label: 'Flyer / Affiche',       category: 'Document', icon: FileText,   image: JOB_IMAGES['Flyer / Affiche'] },
      { label: 'Impression HD',     category: 'Document', icon: FileText,   image: JOB_IMAGES['Impression HD'] },
    ];
  }
  return [
    { label: 'Réseaux sociaux', category: 'Social', icon: Smartphone, image: JOB_IMAGES['Réseaux sociaux'] },
    { label: 'Textes libres',   category: 'Social', icon: FileText,   image: JOB_IMAGES['Textes libres'] },
  ];
};

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
              colors={['transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent', 'transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent']}
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

function PackIcon({ planType, size = 48, isSelected }: { planType: string; size?: number; isSelected: boolean }) {
  const source = PACK_IMAGES[planType] ?? PACK_IMAGES['curieux'];
  return (
    <View style={isSelected ? s.iconGlow : undefined}>
      <Image
        source={source}
        style={{ width: size, height: size, tintColor: isSelected ? NEON_BLUE : colors.text.muted }}
        resizeMode="contain"
      />
    </View>
  );
}

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
  } catch (e) {}

  return text;
};

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
  const { setArchitecture } = useCreationStore();
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

  const planType             = user?.planType || 'curieux';
  const subStatus            = user?.subscriptionStatus;
  const now     = new Date();
  const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const isExpired = endDate && now > endDate;

  // Si le statut est actif ou si la date n'est pas encore expirée (cas d'une annulation en cours de mois)
  const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial' || (endDate && !isExpired);
  const isPackCurieux        = planType === 'curieux';

  const fns = getUniversalFunctions(planType);

  useEffect(() => {
    if (fns.length > 0 && !selectedFunction) {
      setFunction(fns[0].label, fns[0].category);
    }
  }, [planType]);

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

  const effectivePlanId   = isPackCurieux && isExpired ? 'studio' : planType;
  const fallbackPlan      = { id: effectivePlanId, name: 'Chargement...', price: '...' };
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

  const isTrialButNoCard      = isPackCurieux && !user?.stripeCustomerId;
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

      await api.post('/ai/payment/confirm-plan', {
        planId: currentPlanObject?.id,
        paymentIntentId: data.paymentIntent?.id,
      });

      setIsPaymentLoading(false);
      await useAuthStore.getState().updateAiProfile({ subscriptionStatus: (planType === 'curieux' ? 'trial' : 'active') as any, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId });
      await useAuthStore.getState().aiRefreshUser();
      showModal('success', 'Félicitations !', 'Votre abonnement est maintenant actif.');
    } catch (e: any) {
      console.error('Stripe error:', e);
      showModal('error', 'Erreur', e?.message || 'Une erreur est survenue lors du paiement.');
    } finally { setIsPaymentLoading(false); }
  };

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

  const handleSend = async () => {
    // Hidden on home screen but kept for logic
  };

  const copyToClipboard = (text: string) => {};

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    if (!conversationId) { resetChat(); return; }
    try {
      setIsGenerating(true);
      await AiService.deleteGeneration(conversationId);
      resetChat();
      router.setParams({ chatId: undefined, conversationId: undefined });
    } catch (error) {
      console.error('[HomeScreen] Delete conversation error:', error);
    } finally { setIsGenerating(false); }
  };

  const resetChat = () => {
    clearChatStore(); setInputValue(''); setConversationId(null); resetCreationStore();
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.job) setJob(currentUser.job);
    if (fns.length > 0) setFunction(fns[0].label, fns[0].category);
  };

  const scrollY = useSharedValue(0);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [0, 0.95], Extrapolate.CLAMP);
    const borderOpacity = interpolate(scrollY.value, [0, 50], [0, 0.08], Extrapolate.CLAMP);

    return {
      backgroundColor: `rgba(3, 8, 20, ${opacity})`,
      borderBottomColor: `rgba(255, 255, 255, ${borderOpacity})`,
    };
  });

  return (
    <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={2}>
      <View style={{ flex: 1, backgroundColor : 'transparent' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <Animated.View style={[s.topBar, { paddingTop: insets.top + (Platform.OS === 'ios' ? 50 : 60) }, headerAnimatedStyle]}>
            {!isPaidPlanButInactive && (
              <TouchableOpacity style={s.menuBtn} onPress={() => navigation.openDrawer()}>
                <View style={s.iconGlow}>
                  <Menu size={24} color={'#fff'} />
                </View>
              </TouchableOpacity>
            )}
            <View />
            <View style={s.topRight}>
              {/* Mode Guidé button removed as requested */}
            </View>
          </Animated.View>

          <View style={[s.scroll, s.scrollContent]}>
            <View style={s.titleBlock}>
              <Text style={s.greeting}>{getGreetingByTime()} {user?.name || ''}</Text>
              <Text style={s.titleArimo}>Que souhaitez-vous</Text>
              <Text style={s.titleBrittany}>produire ?</Text>
              {user?.job && (
                <View style={s.jobRow}>
                  <Text style={s.jobLabel}>{user?.job}</Text>
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
                        if (fn.label === 'Textes libres') {
                          router.push('/(drawer)/freetext');
                        } else if (fn.label === 'Historique flyers') {
                          router.push('/(drawer)/impression-hd-history');
                        } else if (fn.category === 'Document') {
                          setArchitecture(null);
                          router.push('/(guided)/step3-directions');
                        } else {
                          router.push('/(guided)/step4-personalize');
                        }
                      }, 300);
                    }}
                  >
                    <NeonBorderCard isSelected={isSelected}>
                      <View style={[s.card, isSelected && s.cardSelected]}>
                        <View style={[s.iconBox, isSelected && s.iconBoxActive]}>
                          {fn.image ? (
                            <Image
                              source={fn.image}
                              style={{ width: 44, height: 44, tintColor: isSelected ? NEON_BLUE : colors.text.muted }}
                              resizeMode="contain"
                            />
                          ) : (
                            <PackIcon planType={planType} size={44} isSelected={isSelected} />
                          )}
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
          </View>

          <View
            className="px-5 pb-3 "
            style={{
              paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 12,
            }}
          >
            {isPaidPlanButInactive ? (
              <View className="h-20" />
            ) : (
              null
            )}
          </View>
        </KeyboardAvoidingView>

        {isPaidPlanButInactive && (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
            pointerEvents="box-none"
          >
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
              pointerEvents="auto"
            />

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

const s = StyleSheet.create({
  topBar:        { 
    position: 'absolute', top: -10, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: 'transparent'
  },
  menuBtn:       { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.darkSlateBlue, justifyContent: 'center', alignItems: 'center' },
  topRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guidedBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary.main + '1f', borderWidth: 1, borderColor: colors.primary.main + '4d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  guidedBtnText: { color: colors.primary.main, fontSize: 12, fontWeight: '700', fontFamily: fonts.arimo.bold },
  scroll:        { flex: 1, paddingHorizontal: H_PADDING },
  scrollContent: { flexGrow: 1, paddingTop: 200, backgroundColor : 'transparent' },
  titleBlock:    { alignItems: 'center', marginTop: 32, marginBottom: 24 },
  greeting:      { fontFamily: fonts.arimo.regular, fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textAlign: 'center' },
  titleArimo:    { fontFamily: fonts.arimo.bold, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  titleBrittany: { fontFamily: fonts.brittany, fontSize: 38, color: 'white', textAlign: 'center', textShadowColor: NEON_BLUE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3, paddingLeft : 20 },
  jobRow:        { marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  jobLabel:      { fontFamily: fonts.arimo.bold, fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase' },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP, marginBottom: 8 },
  gridItem: { width: CARD_W },
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
  iconGlow:          { shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  cardLabel:         { fontFamily: fonts.arimo.bold, fontSize: 13, color: colors.text.secondary, textAlign: 'center' },
  cardLabelSelected: { color: 'white', textShadowColor: NEON_BLUE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  neonWrapper: { position: 'relative', marginBottom: 2 },
  neonClip:    { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 21, overflow: 'hidden', zIndex: 2 },
  neonTrack:   { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask:    { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 20, zIndex: 1 },
  bloomMid:    { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 24, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 8 },
  bloomFar:    { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 28, backgroundColor: 'transparent', shadowColor: NEON_BLUE_DARK, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 28, elevation: 4 },
  floorGlow:   { position: 'absolute', bottom: -16, alignSelf: 'center', width: '80%', height: 24, borderRadius: 50, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 20, opacity: 0.4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontFamily: fonts.arimo.bold, fontSize: 11, letterSpacing: 2, color: '#64748b' },
  messagesBlock: { gap: 12, paddingTop: 20 },
  loadingBlock:  { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText:   { marginTop: 16, color: '#94a3b8', fontFamily: fonts.arimo.regular },
  bubble:        { maxWidth: '85%', borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 8 },
  bubbleUser:    { backgroundColor: colors.primary.main + '33', borderColor: colors.primary.main + '66', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAi:      { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.15)' },
  bubbleText:    { fontSize: 15, lineHeight: 24, color: '#cbd5e1', fontFamily: fonts.arimo.regular },
  copyBtn:       { marginTop: 8, alignSelf: 'flex-end', padding: 4 },
  generatingDot: { width: 56, height: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16 },
  inputWrapper: { paddingHorizontal: 20, paddingTop: 4 },
});