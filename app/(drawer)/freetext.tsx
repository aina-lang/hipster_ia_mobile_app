  import React, { useRef, useState, useEffect } from 'react';
  import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    Keyboard,
  } from 'react-native';
  import { Audio } from 'expo-av';
  import * as MediaLibrary from 'expo-media-library';
  import * as Clipboard from 'expo-clipboard';
  import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
  import { useRouter, useNavigation, useGlobalSearchParams } from 'expo-router';
  import { DrawerNavigationProp } from '@react-navigation/drawer';
  import * as Notifications from 'expo-notifications';
  import * as ImagePicker from 'expo-image-picker';

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  import {
    Trash2,
    Mic,
    Copy,
  } from 'lucide-react-native';
  import { useStripe } from '@stripe/stripe-react-native';
  import { UsageBar } from '../../components/UsageBar';
  import { useAuthStore } from '../../store/authStore';
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
  import { useSpeechToText } from '../../hooks/useSpeechToText';
  import { NeonBackButton } from 'components/ui/NeonBackButton';

  export default function FreetextScreen() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { chatId, conversationId: paramConversationId, reset } = useGlobalSearchParams();
    const idToLoad = (paramConversationId ?? chatId) as string | undefined;
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const { isRecording, isProcessing, resetTranscript } = useSpeechToText();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const [inputValue, setInputValue] = useState('');
    const { messages, setMessages, conversationId, setConversationId, resetChat: clearChatStore } = useChatStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    useEffect(() => {
      const keyboardWillShow = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
          const height = e.endCoordinates?.height || 0;
          setKeyboardHeight(height);
          // Scroll AUTO vers le bas quand le clavier s'ouvre
          if (messages.length > 0) {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          }
        }
      );

      const keyboardWillHide = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardHeight(0);
        }
      );

      return () => {
        keyboardWillShow.remove();
        keyboardWillHide.remove();
      };
    }, [messages.length]);

    useEffect(() => {
      if (messages.length > 0) {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }, [messages]);

    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const resp = await api.get('/ai/payment/plans');
        const backendPlans = resp.data?.data ?? resp.data ?? [];
        const mappedPlans = backendPlans.map((p: any) => ({
          ...p,
          price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€ / mois` : p.price,
        }));
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
            showModal('error', 'Permission refusée', "Veuillez autoriser l'accès au micro pour utiliser la dictée vocale.");
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
        showModal('error', 'Erreur', "Impossible de démarrer l'enregistrement.");
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
        showModal('error', 'Erreur', "Impossible de sélectionner l'image.");
      }
    };

    async function stopRecording() {
      if (!recording) return;

      setRecording(null);
      setIsGenerating(true);

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

        if (response.data?.text) {
          setInputValue((prev) => (prev ? prev + ' ' + response.data.text : response.data.text));
        }
      } catch (err) {
        console.error('Transcription error', err);
        showModal('error', 'Erreur', "Impossible de transcrire l'audio.");
      } finally {
        setIsGenerating(false);
      }
    }

    const planType = user?.planType || 'curieux';
    const subStatus = user?.subscriptionStatus;
    const stripeId = user?.stripeCustomerId;
    const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
    const isPackCurieux = planType === 'curieux';

    const now = new Date();
    const endDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = endDate && now > endDate;

    const effectivePlanId = (isPackCurieux && isExpired) ? 'studio' : planType;
    const currentPlanObject = plans.find(p => p.id === effectivePlanId) || plans.find(p => p.id === 'atelier');

    const isTrialButNoCard = isPackCurieux && !stripeId;
    const isPaidPlanButInactive = !isSubscriptionActive || isTrialButNoCard || (isPackCurieux && isExpired);

    const showModal = (type: ModalType, title: string, message: string) => {
      setModalType(type);
      setModalTitle(title);
      setModalMessage(message);
      setModalVisible(true);
    };

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

    const handleStripePayment = async () => {
      const planConfig = plans.find(p => p.id === planType);
      if (!planConfig && planType !== 'curieux') return;

      setIsPaymentLoading(true);
      try {
        const isCurieux = planType === 'curieux';
        const payload = {
          priceId: !isCurieux ? planConfig?.stripePriceId : undefined,
          planId: planType,
          userId: user?.id,
        };

        const resp = await api.post('/ai/payment/create-payment-sheet', payload);
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

        await api.post('/ai/payment/confirm-plan', {
          planId: planType,
          subscriptionId,
        });

        await useAuthStore.getState().updateAiProfile({
          subscriptionStatus: (planType === 'curieux' ? 'trial' : 'active') as any,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
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
        } catch (e) {
          setIsBackendConnected(false);
        }
      };
      checkConnection();
      useAuthStore.getState().aiRefreshUser().catch(console.error);

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
        router.setParams({ reset: undefined });
      }
    }, [reset]);

    useEffect(() => {
      const loadConversation = async () => {
        if (!idToLoad) return;

        setIsLoadingConversation(true);
        try {
          const conversation = await AiService.getConversation(idToLoad);
          if (!conversation) return;

          setConversationId(idToLoad);

          let storedMessages: any[] = [];
          let isOldFormat = false;

          try {
            const parsed = JSON.parse(conversation.prompt);
            if (Array.isArray(parsed)) {
              storedMessages = parsed;
            } else {
              isOldFormat = true;
            }
          } catch (e) {
            isOldFormat = true;
          }

          const uiMessages: Message[] = [];

          if (isOldFormat) {
            if (conversation.prompt) {
              uiMessages.push({
                id: `${idToLoad}-user`,
                text: conversation.prompt,
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
            storedMessages.forEach((msg, index) => {
              if (msg.role === 'user' || msg.role === 'assistant') {
                uiMessages.push({
                  id: `${idToLoad}-${index}`,
                  text: msg.content,
                  sender: (msg.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                  timestamp: new Date(),
                  isTyping: false,
                  type: msg.type || 'text',
                  mediaUrl: msg.url || msg.mediaUrl,
                });
              }
            });

            if (conversation.result) {
              const lastMsg = uiMessages[uiMessages.length - 1];
              const resultMatches = lastMsg && lastMsg.sender === 'ai' && lastMsg.text === conversation.result;
              if (!resultMatches) {
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

          setMessages(uiMessages);
        } catch (error) {
          console.error('[DEBUG] Failed to load conversation:', error);
        } finally {
          setIsLoadingConversation(false);
        }
      };

      loadConversation();
    }, [idToLoad]);

    const placeholderText = 'On brainstorm autour d\'un café ? ☕';
    const hasMessages = messages.length > 0;

    const promptLimit = user?.promptsLimit || 0;
    const promptUsed = user?.promptsUsed || 0;
    const imagesLimit = user?.imagesLimit || 0;
    const imagesUsed = user?.imagesUsed || 0;

    const isTextExhausted = isPackCurieux && promptLimit > 0 && promptLimit !== 999999 && promptUsed >= promptLimit;
    const isImagesExhausted = isPackCurieux && imagesLimit > 0 && imagesLimit !== 999999 && imagesUsed >= imagesLimit;
    const isFullyExhausted = isPackCurieux && isTextExhausted && isImagesExhausted;

    const isAnyMessageTyping = messages.some(m => m.isTyping);
    const isInputDisabled = isGenerating || isFullyExhausted || isAnyMessageTyping;

    useEffect(() => {
      if (messages.length > 0) {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }, [messages]);

    const handleSend = async () => {
      if ((!inputValue.trim() && !selectedImage) || isGenerating) return;

      const currentImage = selectedImage;

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

        chatHistory.push({
          role: 'system',
          content: `Tu es Hipster IA. ${systemContext}. IMPORTANT: Ne jamais utiliser d'emojis dans tes réponses. Garde un ton professionnel et direct.`,
        });

        messages.forEach((m) =>
          chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })
        );

        chatHistory.push({ role: 'user', content: userMsg.text });

        const convIdToSend = conversationId || generateConversationId();
        if (!conversationId) {
          setConversationId(convIdToSend);
        }

        let response;

        if (currentImage) {
          const formData = new FormData();
          formData.append('messages', JSON.stringify(chatHistory));
          formData.append('conversationId', convIdToSend);

          const filename = currentImage.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const ext = match ? match[1] : 'jpg';

          formData.append('file', {
            uri: currentImage,
            name: filename,
            type: `image/${ext}`,
          } as any);

          const res = await api.post('/ai/chat', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          response = res.data.data;
        } else {
          response = await AiService.chat(chatHistory, convIdToSend);
        }

        if (!conversationId && response.conversationId) {
          setConversationId(response.conversationId);
        }

        const content = response.data?.content ?? response.content ?? response.message ?? response;

        let mediaUrl: string | undefined;

        const isImageAsync = response.type === 'image' && !response.imageBase64 && !response.mediaUrl && response.generationId;

        if (isImageAsync) {
          let isCompleted = false;
          let attempts = 0;
          const maxAttempts = 30;

          while (!isCompleted && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
              const updatedGen = await AiService.getConversation(response.generationId.toString());
              const imageUrl = updatedGen?.imageUrl || updatedGen?.url || updatedGen?.image;

              if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                mediaUrl = imageUrl;
                isCompleted = true;
              } else if (updatedGen?.result?.startsWith('ERROR')) {
                throw new Error(updatedGen.result);
              }
            } catch (pollError) {
              console.warn('[DEBUG] Poll error on attempt', attempts, ':', pollError);
            }
          }

          if (!isCompleted) {
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
          mediaUrl,
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
        useAuthStore.getState().aiRefreshUser().catch(console.error);
      }
    };

    const copyToClipboard = async (text: string) => {
      try {
        // ✅ Utilisation de expo-clipboard (non déprécié)
        await Clipboard.setStringAsync(text);
        showModal('success', 'Copié !', 'Le message a été copié dans le presse-papiers.');
      } catch (error) {
        console.error('Copy error:', error);
        showModal('error', 'Erreur', 'Impossible de copier le texte.');
      }
    };

    const handleDeleteConfirm = async () => {
      setShowDeleteConfirm(false);
      if (!conversationId) {
        resetChat();
        return;
      }
      try {
        setIsGenerating(true);
        await AiService.deleteGeneration(conversationId);
        resetChat();
        router.setParams({ chatId: undefined, conversationId: undefined });
        showModal('success', 'Succès', 'Conversation supprimée avec succès.');
      } catch (error) {
        console.error('[DEBUG] Delete conversation error:', error);
        showModal('error', 'Erreur', 'Impossible de supprimer la conversation.');
      } finally {
        setIsGenerating(false);
      }
    };

    const resetChat = () => {
      clearChatStore();
      setInputValue('');
      setConversationId(null);
    };

    // ✅ Corrigé : vérifie `recording` (state local) au lieu de `isRecording` (hook)
    const handleMicrophonePress = async () => {
      if (recording) {
        await stopRecording();
      } else {
        await startRecording();
      }
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
      <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={2}>
        {/* ✅ Structure corrigée : SafeAreaView > ScrollView + KeyboardAvoidingView en frères */}
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>

          {/* Header */}
          <View
            className="flex-row items-center justify-between px-5 pb-2"
            style={{ paddingTop: insets.top + 10 }}
          >
            <NeonBackButton onPress={() => router.back()} />
            <View className="flex-row items-center gap-2">
              {hasMessages && (
                <TouchableOpacity
                  className="rounded-lg bg-white/5 p-2"
                  onPress={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={20} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ✅ ScrollView pour les messages — occupe tout l'espace disponible */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              flexGrow: 1, 
              paddingHorizontal: 20, 
              paddingTop: 12, 
              paddingBottom: 100
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!hasMessages ? (
              <View className="mt-5 items-center">
                <Text className="mb-2 text-lg text-slate-500">
                  {getGreetingByTime()} {user?.name || 'Utilisateur'}
                </Text>
                <Text className="text-center text-2xl font-bold leading-9 text-slate-300">
                  {"Que créons-nous aujourd'hui ?"}
                </Text>
              </View>
            ) : (
              <View className="space-y-3 pt-5">
                {isLoadingConversation ? (
                  <View className="items-center justify-center py-10">
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text className="mt-4 text-slate-400">Chargement de la conversation...</Text>
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
                        }
                      >
                        {msg.type && msg.type !== 'text' && msg.mediaUrl && (
                          <MediaDisplay type={msg.type} url={msg.mediaUrl} showModal={showModal} />
                        )}

                        {msg.sender === 'user' ? (
                          msg.text ? (
                            <Text className="text-base leading-6 text-slate-300">{msg.text}</Text>
                          ) : null
                        ) : msg.isTyping ? (
                          <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} />
                        ) : msg.text ? (
                          <Text className="text-base leading-6 text-slate-300">{msg.text}</Text>
                        ) : null}

                        {msg.sender === 'ai' && !msg.isTyping && (!msg.type || msg.type === 'text') && msg.text && (
                          <TouchableOpacity
                            onPress={() => copyToClipboard(msg.text)}
                            className="mt-2 self-end p-1"
                          >
                            <Copy size={14} color={colors.text.muted} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </>
                )}

                {isGenerating && (
                  <View className="h-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 p-4">
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* ✅ KeyboardAvoidingView avec paddingBottom dynamique = hauteur clavier */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View
              className="px-5"
              style={{
                paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom + 12,
                paddingTop: 0,
              }}
            >
              {isPaidPlanButInactive ? (
                <PaymentBlocker
                  plan={currentPlanObject}
                  onPay={handleStripePayment}
                  loading={isPaymentLoading}
                />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                <View style={{ flex: 1 }}>
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
                  </View>
                  <TouchableOpacity
                    onPress={handleMicrophonePress}
                    disabled={isGenerating || isProcessing}
                    style={{
                      marginBottom: 0,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: recording
                        ? 'rgba(255, 68, 68, 0.15)'
                        : 'rgba(255, 255, 255, 0.08)',
                      borderWidth: 1,
                      borderColor: recording
                        ? 'rgba(255, 68, 68, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)',
                      opacity: isGenerating || isProcessing ? 0.5 : 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Mic size={24} color={recording ? '#ff4444' : colors.text.muted} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>

        </SafeAreaView>

        <GenericModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />

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