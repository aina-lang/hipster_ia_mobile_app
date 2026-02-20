import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useGlobalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import * as Notifications from 'expo-notifications';
import { Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


import {
  Compass,
  Menu,
  Image as ImageIcon,
  Paperclip,
  Send,
  Mic,
  Copy,
  Trash2,
  Wifi,
  WifiOff,
  Plus,
  CreditCard,
  X,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { UsageBar } from '../../components/UsageBar';
import { useAuthStore } from '../../store/authStore';
import { useCreationStore } from '../../store/creationStore';
import { useChatStore, Message } from '../../store/chatStore';
import { AiService } from '../../api/ai.service';
import { api } from '../../api/client';
import { colors } from '../../theme/colors';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { MediaDisplay } from '../../components/MediaDisplay';
import { TypingMessage, TypingPlaceholder } from '../../components/TypingMessage';
import { PaymentBlocker } from '../../components/PaymentBlocker';
import { ChatInput } from '../../components/ChatInput';





export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { chatId, reset } = useGlobalSearchParams();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [inputValue, setInputValue] = useState('');
  const { messages, setMessages, conversationId, setConversationId, resetChat: clearChatStore } = useChatStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Plans State
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Audio Recording
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const resp = await api.get('/ai/payment/plans');
      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€ / mois` : p.price,
      }));

      // Manual override for Curieux price display if needed or verify backend returns "Gratuit"
      // Assuming backend consistency

      setPlans(mappedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        const resp = await requestPermission();
        if (resp.status !== 'granted') {
          showModal('error', 'Permission refusée', 'Veuillez autoriser l\'accès au micro pour utiliser la dictée vocale.');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      showModal('error', 'Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal('error', 'Permission refusée', 'Veuillez autoriser l\'accès à la galerie pour sélectionner une photo.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showModal('error', 'Erreur', 'Impossible de sélectionner l\'image.');
    }
  };

  async function stopRecording() {
    if (!recording) return;

    setRecording(null);
    setIsGenerating(true); // Reuse generating state for loader

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No URI');

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await api.post('/ai/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.text) {
        setInputValue((prev) => (prev ? prev + ' ' + response.data.text : response.data.text));
      }
    } catch (err) {
      console.error('Transcription error', err);
      showModal('error', 'Erreur', 'Impossible de transcrire l\'audio.');
    } finally {
      setIsGenerating(false);
    }
  }

  const planType = user?.planType || 'curieux';
  const subStatus = user?.subscriptionStatus;
  const stripeId = user?.stripeCustomerId;
  const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
  const isPackCurieux = planType === 'curieux';

  // Check Expiration
  const now = new Date();
  const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const isExpired = endDate && now > endDate;

  // If Curieux and expired => force Studio for blocker display
  const effectivePlanId = (isPackCurieux && isExpired) ? 'studio' : planType;

  // Find the effective plan object
  const currentPlanObject = plans.find(p => p.id === effectivePlanId) || plans.find(p => p.id === 'atelier');

  // Logic: Block if subscription is NOT active/trialing OR if Curieux trial hasn't been activated with a card
  // OR if the trial has expired (even if active in Stripe, our local rule says 7 days).
  const isTrialButNoCard = isPackCurieux && !stripeId;
  const isPaidPlanButInactive = !isSubscriptionActive || isTrialButNoCard || (isPackCurieux && isExpired);

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // Feature access control based on subscription plan
  const hasFeatureAccess = (feature: 'text' | 'image' | 'audio' | 'video' | '3d'): boolean => {
    const accessMatrix: Record<string, string[]> = {
      text: ['curieux', 'atelier', 'studio', 'agence'],
      image: ['curieux', 'atelier', 'studio', 'agence'],
      audio: ['studio', 'agence'],
      video: ['studio', 'agence'],
      '3d': ['agence'],
    };

    return accessMatrix[feature]?.includes(planType) || false;
  };

  const checkFeatureAccess = (feature: 'text' | 'image' | 'audio' | 'video' | '3d'): boolean => {
    if (hasFeatureAccess(feature)) {
      return true;
    }

    const requiredPlans: Record<string, string> = {
      audio: 'Studio',
      video: 'Studio',
      '3d': 'Agence',
    };

    const featureNames: Record<string, string> = {
      text: 'Génération de texte',
      image: 'Génération d\'images',
      audio: 'Génération audio',
      video: 'Génération vidéo',
      '3d': 'Génération 3D',
    };

    showModal(
      'warning',
      'Fonctionnalité non disponible',
      `${featureNames[feature]} n'est disponible qu'à partir du pack ${requiredPlans[feature]}. Passez à un plan supérieur pour y accéder.`
    );

    return false;
  };

  const handleStripePayment = async () => {
    const planConfig = plans.find(p => p.id === planType);

    // Safety check: if plans aren't loaded yet or strictly curieux with stripePriceId null
    // But for curieux we handle it specially below
    if (!planConfig && planType !== 'curieux') return;

    setIsPaymentLoading(true);
    try {
      // Determine correct params based on plan
      const isCurieux = planType === 'curieux';

      const payload = {
        priceId: !isCurieux ? planConfig?.stripePriceId : undefined,
        planId: planType,
        userId: user?.id,
      };

      const resp = await api.post(`/ai/payment/create-payment-sheet`, payload);

      const data = resp.data?.data ?? resp.data ?? resp;
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
        showModal('error', 'Paiement échoué', presentResult.error.message || 'Erreur lors du paiement');
        return;
      }

      // Success
      await api.post('/ai/payment/confirm-plan', {
        planId: planType,
        subscriptionId: subscriptionId
      });

      // Update local store
      await useAuthStore.getState().updateAiProfile({
        subscriptionStatus: (planType === 'curieux' ? 'trial' : 'active') as any,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId
      });

      showModal('success', 'Félicitations !', 'Votre abonnement est maintenant actif.');
    } catch (e: any) {
      console.error('Stripe error:', e);
      showModal('error', 'Erreur', e?.message || 'Une erreur est survenue lors du paiement.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get('/ai/ping').catch(() => null);
        setIsBackendConnected(!!response);
        if (!response) console.warn('[DEBUG] Backend unreachable at', api.defaults.baseURL);
      } catch (e) {
        setIsBackendConnected(false);
      }
    };
    checkConnection();
    useAuthStore.getState().aiRefreshUser().catch(console.error);

    // Request permissions upfront
    const requestInitialPermissions = async () => {
      try {
        await MediaLibrary.requestPermissionsAsync();
        await Notifications.requestPermissionsAsync();
        await Audio.requestPermissionsAsync();
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (e) {
        console.warn('Error requesting permissions:', e);
      }
    };
    requestInitialPermissions();
  }, []);

  useEffect(() => {
    if (reset === 'true') {
      resetChat();
      // Clean URL params to avoid re-triggering on reload
      router.setParams({ reset: undefined });
    }
  }, [reset]);

  useEffect(() => {
    const loadConversation = async () => {
      if (chatId) {
        setIsLoadingConversation(true);
        try {
          console.log('[DEBUG] Loading conversation:', chatId);
          const conversation = await AiService.getConversation(chatId as string);

          if (conversation) {
            console.log(conversation);

            // Set the conversation ID
            setConversationId(chatId as string);

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

            const uiMessages: Message[] = [];

            if (isOldFormat) {
              // Old format: just show the prompt and result
              if (conversation.prompt) {
                uiMessages.push({
                  id: `${chatId}-user`,
                  text: conversation.prompt,
                  sender: 'user',
                  timestamp: new Date(conversation.createdAt),
                  isTyping: false,
                });
              }
              if (conversation.result) {
                uiMessages.push({
                  id: `${chatId}-ai`,
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
                    id: `${chatId}-${index}`,
                    text: msg.content,
                    sender: (msg.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                    timestamp: new Date(),
                    isTyping: false,
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
                    id: `${chatId}-result`,
                    text: conversation.result,
                    sender: 'ai',
                    timestamp: new Date(),
                    isTyping: false,
                  });
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
  }, [chatId]);

  const placeholderText = 'Décrivez votre idée, ajoutez une image ou un audio...';
  const hasMessages = messages.length > 0;

  // Credit and message limit checks
  const promptLimit = user?.promptsLimit || 0;
  const promptUsed = user?.promptsUsed || 0;
  const imagesLimit = user?.imagesLimit || 0;
  const imagesUsed = user?.imagesUsed || 0;

  const textRemaining = Math.max(0, promptLimit - promptUsed);
  const imagesRemaining = Math.max(0, imagesLimit - imagesUsed);

  const isTextExhausted = isPackCurieux && promptLimit > 0 && promptLimit !== 999999 && promptUsed >= promptLimit;
  const isImagesExhausted = isPackCurieux && imagesLimit > 0 && imagesLimit !== 999999 && imagesUsed >= imagesLimit;
  const isFullyExhausted = isPackCurieux && isTextExhausted && isImagesExhausted;

  // Check if any message is currently typing visually
  const isAnyMessageTyping = messages.some(m => m.isTyping);

  // For the chat input, we only block if BOTH are reached or if currently generating or typing
  const isInputDisabled = isGenerating || isFullyExhausted || isAnyMessageTyping;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isGenerating) return;

    const currentImage = selectedImage;

    // Check credits
    if (isTextExhausted) {
      const textLimitMsg = promptLimit >= 999999 ? 'illimitée' : `de ${promptLimit} texte${promptLimit > 1 ? 's' : ''}`;
      showModal('error', 'Limite textes atteinte', `Vous avez atteint votre limite ${textLimitMsg} ${isPackCurieux ? 'par jour' : 'par mois'}. Vous pouvez encore générer des images !`);
      return;
    }


    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
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
      const chatHistory = [];
      const systemContext = `
      Identité: Hipster IA
      Rôle: Assistant créatif et intelligent
      Cible: ${user?.email?.split('@')[0] || "l'utilisateur"}
      Contexte: ${user?.type !== 'ai' && user?.job ? `Métier: ${user.job}` : ''}
    `;

      chatHistory.push({ role: 'system', content: `Tu es Hipster IA. ${systemContext}. IMPORTANT: Ne jamais utiliser d'emojis dans tes réponses. Garde un ton professionnel et direct.` });

      messages.forEach((m) =>
        chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })
      );

      chatHistory.push({ role: 'user', content: userMsg.text });

      console.log('[DEBUG] Free Mode Chat History:', JSON.stringify(chatHistory, null, 2));
      console.log('[DEBUG] Conversation ID:', conversationId);

      let response;
      // Real Backend Call
      if (currentImage) {
        const formData = new FormData();
        formData.append('messages', JSON.stringify(chatHistory));
        if (conversationId) formData.append('conversationId', conversationId);

        const filename = currentImage.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        const type = `image/${ext}`;

        formData.append('file', {
          uri: currentImage,
          name: filename,
          type,
        } as any);

        const res = await api.post('/ai/chat', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        response = res.data.data;
      } else {
        response = await AiService.chat(chatHistory, conversationId);
      }

      console.log('[DEBUG] Response:', JSON.stringify(response, null, 2));

      // Store conversation ID for subsequent messages
      if (response.conversationId) {
        setConversationId(response.conversationId);
        console.log('[DEBUG] Updated conversationId to:', response.conversationId);
      }

      // Handle nested response structure
      const content = response.data?.content ?? response.content ?? response.message ?? response;

      // Format image base64 for React Native
      let mediaUrl: string | undefined;
      
      // Check if image generation is async (url is null but generationId exists)
      const isImageAsync = response.type === 'image' && !response.imageBase64 && !response.mediaUrl && response.generationId;
      console.log('[DEBUG] Free Mode - isImageAsync:', isImageAsync, 'generationId:', response.generationId);
      
      if (isImageAsync) {
        // Implement polling like in guided mode
        console.log('[DEBUG] ⏳ Starting Free Mode polling with generationId:', response.generationId);
        let isCompleted = false;
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds with 2s intervals
        
        while (!isCompleted && attempts < maxAttempts) {
          attempts++;
          console.log(`[DEBUG] 🔄 Free Mode Poll attempt ${attempts}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            const updatedGen = await AiService.getConversation(response.generationId.toString());
            console.log('[DEBUG] Free Mode Poll response:', JSON.stringify(updatedGen, null, 2));
            const imageUrl = updatedGen?.imageUrl || updatedGen?.url || updatedGen?.image;
            console.log('[DEBUG] Extracted imageUrl:', imageUrl);
            
            if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
              console.log('[DEBUG] ✅ Free Mode image found:', imageUrl);
              mediaUrl = imageUrl;
              isCompleted = true;
            } else if (updatedGen?.result?.startsWith('ERROR')) {
              throw new Error(updatedGen.result);
            }
          } catch (pollError) {
            console.warn('[DEBUG] ⚠️ Free Mode poll error on attempt', attempts, ':', pollError);
          }
        }
        
        if (!isCompleted) {
          console.error('[DEBUG] ❌ Free Mode polling timed out');
          throw new Error('Image generation timed out');
        }
      } else if (response.type === 'image' && response.imageBase64) {
        mediaUrl = `data:image/png;base64,${response.imageBase64}`;
      } else {
        mediaUrl = response.mediaUrl;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: typeof content === 'string' ? content : JSON.stringify(content),
        sender: 'ai',
        timestamp: new Date(),
        isTyping: !!(typeof content === 'string' && content.length > 0),
        type: response.type || 'text',
        mediaUrl: mediaUrl,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('[DEBUG] Free Mode Error:', error);
      const errMsg = error?.response?.data?.message || error.message || 'Erreur inconnue';
      showModal('error', 'Erreur de génération', errMsg);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Désolé, une erreur est survenue lors de la génération.',
          sender: 'ai',
          timestamp: new Date(),
          isTyping: true,
        },
      ]);
    } finally {
      setIsGenerating(false);
      // Refresh credits to update limits in real-time
      useAuthStore.getState().aiRefreshUser().catch(console.error);
    }
  };

  const copyToClipboard = (text: string) => {
    // implement clipboard logic
  };

  const resetChat = () => {
    clearChatStore();
    setInputValue('');
    console.log('[DEBUG] Starting new conversation');
  };

  const completeTyping = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, isTyping: false } : msg))
    );
  };

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <BackgroundGradientOnboarding blurIntensity={90}>
      <View className="flex-1" >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <View
            className="flex-row items-center justify-between px-5 pb-2"
            style={{ paddingTop: insets.top + 10 }}
          >
            <TouchableOpacity
              className="rounded-lg bg-white/5 p-2"
              onPress={() => navigation.openDrawer()}>
              <Menu size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              {/* <TouchableOpacity
              className="flex-row items-center gap-2 rounded-xl bg-white/5 py-2 px-3 border border-white/10"
              onPress={resetChat}>
              <Plus size={18} color={colors.primary.main} />
              <Text className="text-white font-medium text-sm">Nouveau</Text>
            </TouchableOpacity> */}

              {hasMessages && (
                <TouchableOpacity className="rounded-lg bg-white/5 p-2" onPress={resetChat}>
                  <Trash2 size={20} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Chat / Welcome */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-5 pt-12 "
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {!hasMessages ? (
              <>
                <View className="mt-5 items-center">
                  <Text className="mb-2 text-lg text-white/60">
                    {getGreetingByTime()}{' '}
                    {user?.email?.split('@')[0] || 'Utilisateur'}
                  </Text>
                  <Text className="text-center text-2xl font-bold leading-9 text-white">
                    {user?.job ? `Prêt pour votre prochaine création en tant que ${user.job.toLowerCase()} ?` : 'Que créons-nous aujourd\'hui ?'}
                  </Text>
                </View>


                <TouchableOpacity
                  className="bg-white/3 z-50 mt-80 mb-5 flex-row items-center gap-4 rounded-2xl border border-white/5 p-5"
                  onPress={() => {
                    if (isFullyExhausted) {
                      showModal('info', 'Limite quotidienne atteinte', 'Vous avez utilisé vos 2 textes et 2 images du jour. Revenez demain !');
                      return;
                    }

                    useCreationStore.getState().reset();
                    // If user already has a non-free plan, go straight to guided flow
                    const userPlan = user?.planType;
                    if (userPlan && userPlan !== 'curieux') {
                      router.push('/(guided)/step1-job');
                      return;
                    }

                    // Otherwise, ask to choose a plan first
                    router.push('/(drawer)/subscription');
                  }}
                  activeOpacity={0.8}
                  style={{ opacity: isFullyExhausted ? 0.5 : 1 }}>
                  <View className="w-15 h-15 items-center justify-center rounded-lg">
                    <Compass size={32} color={colors.primary.main} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-bold text-white">Mode Guidé</Text>
                    <Text className="text-sm leading-5 text-white/60">
                      Laissez-vous accompagner étape par étape pour une création professionnelle.
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="my-5 mb-0 flex-row items-center gap-4 opacity-40">
                  <View className="h-px flex-1 bg-white/20" />
                  <Text className="text-xs font-semibold tracking-wider text-white/60">
                    OU MODE LIBRE
                  </Text>
                  <View className="h-px flex-1 bg-white/20" />
                </View>
              </>
            ) : (
              <View className="space-y-3 pt-5">
                {isLoadingConversation ? (
                  <View className="items-center justify-center py-10">
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text className="mt-4 text-white/60">Chargement de la conversation...</Text>
                  </View>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <View
                        key={msg.id}
                        className="max-w-[85%] rounded-2xl border p-4 mt-4"
                        style={
                          msg.sender === 'user'
                            ? {
                              backgroundColor: 'rgba(44, 70, 155, 0.2)',
                              borderColor: 'rgba(44, 70, 155, 0.4)',
                              alignSelf: 'flex-end',
                              borderBottomRightRadius: 4,
                            }
                            : {
                              alignSelf: 'flex-start',
                              borderBottomLeftRadius: 4,
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            }
                        }>
                        {msg.type && msg.type !== 'text' && msg.mediaUrl && (
                          <MediaDisplay type={msg.type} url={msg.mediaUrl} showModal={showModal} />
                        )}

                        {msg.sender === 'user' ? (
                          msg.text ? <Text className="text-base leading-6 text-white">{msg.text}</Text> : null
                        ) : msg.isTyping ? (
                          <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} />
                        ) : (
                          msg.text ? <Text className="text-base leading-6 text-white">{msg.text}</Text> : null
                        )}

                        {msg.sender === 'ai' && !msg.isTyping && (!msg.type || msg.type === 'text') && msg.text && (
                          <TouchableOpacity
                            onPress={() => copyToClipboard(msg.text)}
                            className="mt-2 self-end p-1">
                            <Copy size={14} color={colors.text.muted} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </>
                )}

                {isGenerating && (
                  <View className="w-15 h-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 p-4">
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  </View>
                )}
              </View>
            )}

            {/* Extra space at bottom to allow scrolling past input */}
            <View className="h-32" />
          </ScrollView>

          {/* Usage Bar */}
          {/* {hasMessages && <UsageBar />} */}

          {/* Input */}
          <View
            className="px-5 pb-3 border-t border-white/5"
            style={{
              paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 12,
              backgroundColor: '#020617', // Consistent footer background
            }}
          >
            {/* Limit warnings */}
            {isPackCurieux && (
              <View className="mb-3 px-1">
                {/* {isTextExhausted && !isImagesExhausted && (
                <Text className="text-xs text-orange-400 font-medium text-center">
                  Limite de textes atteinte aujourd'hui. Vous pouvez encore générer des images !
                </Text>
                )}
              {!isTextExhausted && isImagesExhausted && (
                <Text className="text-xs text-orange-400 font-medium text-center">
                  Limite d'images atteinte aujourd'hui. Vous pouvez encore générer des textes !
                </Text>
              )}
              {isFullyExhausted && (
                <Text className="text-xs text-red-400 font-bold text-center">
                  Limite quotidienne atteinte (2 textes, 2 images). Revenez demain !
                </Text>
              )} */}
                {isPackCurieux && !isFullyExhausted && (
                  <Text className="text-xs text-white/40 text-center mb-2">
                    Aujourd'hui: {textRemaining} textes et {imagesRemaining} images restants
                  </Text>
                )}
              </View>
            )}

            {isPaidPlanButInactive ? (
              <PaymentBlocker
                plan={currentPlanObject} // Pass full plan object
                onPay={handleStripePayment}
                loading={isPaymentLoading}
              />
            ) : (
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
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </BackgroundGradientOnboarding>
  );
}
