import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
// ✅ Utilisation de KeyboardAvoidingView de react-native-keyboard-controller pour une meilleure fiabilité
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useGlobalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useSharedValue } from 'react-native-reanimated';

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
  Copy,
} from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
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
import { NeonBackButton } from '../../components/ui/NeonBackButton';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { fonts } from '../../theme/typography';

export default function FreetextScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { chatId, conversationId: paramConversationId, reset } = useGlobalSearchParams();
  const idToLoad = (paramConversationId ?? chatId) as string | undefined;
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const [inputValue, setInputValue] = useState('');
  const { messages, setMessages, conversationId, setConversationId, resetChat: clearChatStore } = useChatStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
      if (messages.length > 0) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });
    return () => keyboardDidShowListener.remove();
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

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

  useEffect(() => { fetchPlans(); }, []);

  /*
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal('error', 'Permission refusée', 'Veuillez autoriser l\'accès à la galerie.');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
      if (!result.canceled) setSelectedImage(result.assets[0].uri);
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  */

  const planType = user?.planType || 'curieux';
  const subStatus = user?.subscriptionStatus;
  const now = new Date();
  const endDateVal = user?.subscriptionEndDate ? new Date(user?.subscriptionEndDate) : null;
  const isExpired = endDateVal && now > endDateVal;

  // Si le statut est actif ou si la date n'est pas encore expirée (cas d'une annulation en cours de mois)
  const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial' || (!!endDateVal && !isExpired);
  const isPackCurieux = planType === 'curieux';
  
  const effectivePlanId = (isPackCurieux && isExpired) ? 'studio' : planType;
  const currentPlanObject = plans.find(p => p.id === effectivePlanId) || plans.find(p => p.id === 'atelier');

  const isTrialButNoCard = isPackCurieux && !user?.stripeCustomerId;
  const isPaidPlanButInactive = !loadingPlans && currentPlanObject && (!isSubscriptionActive || isTrialButNoCard || (isPackCurieux && isExpired));

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type); setModalTitle(title); setModalMessage(message); setModalVisible(true);
  };

  const handleStripePayment = async () => {
    if (!user?.id) return;
    const planConfig = plans.find(p => p.id === planType);
    if (!planConfig && planType !== 'curieux') return;
    setIsPaymentLoading(true);
    try {
      const isCurieux = planType === 'curieux';
      const payload = { priceId: !isCurieux ? planConfig?.stripePriceId : undefined, planId: planType, userId: user?.id };
      const resp = await api.post('/ai/payment/create-payment-sheet', payload);
      const data = resp.data?.data ?? resp.data ?? resp;
      const paymentIntentClientSecret = data.paymentIntentClientSecret || (!data.setupIntentClientSecret ? (data.clientSecret || data.paymentIntent?.client_secret) : undefined);
      const setupIntentClientSecret = data.setupIntentClientSecret;
      const customerEphemeralKey = data.ephemeralKey || data.customer_ephemeral_key;
      const customerId = data.customerId || data.customer || data.customer_id;
      const subscriptionId = data.subscriptionId;

      if (!paymentIntentClientSecret && !setupIntentClientSecret) throw new Error('Impossible de récupérer le client secret.');

      const initResult = await initPaymentSheet({ paymentIntentClientSecret, setupIntentClientSecret, merchantDisplayName: 'Hipster IA', customerEphemeralKeySecret: customerEphemeralKey, customerId });
      if (initResult.error) throw initResult.error;
      const presentResult = await presentPaymentSheet();
      if (presentResult.error) { showModal('error', 'Paiement échoué', presentResult.error.message || 'Erreur lors du paiement'); return; }

      await api.post('/ai/payment/confirm-plan', { planId: planType, subscriptionId });
      await useAuthStore.getState().updateAiProfile({ subscriptionStatus: (planType === 'curieux' ? 'trial' : 'active') as any, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId });
      showModal('success', 'Félicitations !', 'Votre abonnement est maintenant actif.');
    } catch (e: any) {
      console.error('Stripe error:', e);
      showModal('error', 'Erreur', e?.message || 'Une erreur est survenue lors du paiement.');
    } finally { setIsPaymentLoading(false); }
  };

  useEffect(() => {
    useAuthStore.getState().aiRefreshUser().catch(console.error);
  }, []);

  useEffect(() => {
    if (reset === 'true') { resetChat(); router.setParams({ reset: undefined }); }
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
        try {
          const parsed = JSON.parse(conversation.prompt);
          if (Array.isArray(parsed)) storedMessages = parsed;
        } catch (e) { }
        const uiMessages: Message[] = [];
        if (storedMessages.length === 0) {
          if (conversation.prompt) uiMessages.push({ id: `${idToLoad}-user`, text: conversation.prompt, sender: 'user', timestamp: new Date(conversation.createdAt), isTyping: false });
          if (conversation.result) uiMessages.push({ id: `${idToLoad}-ai`, text: conversation.result, sender: 'ai', timestamp: new Date(conversation.createdAt), isTyping: false });
        } else {
          storedMessages.forEach((msg, index) => {
            if (msg.role === 'user' || msg.role === 'assistant') {
              uiMessages.push({ id: `${idToLoad}-${index}`, text: msg.content, sender: (msg.role === 'user' ? 'user' : 'ai') as 'user' | 'ai', timestamp: new Date(), isTyping: false, type: msg.type || 'text', mediaUrl: msg.url || msg.mediaUrl });
            }
          });
          if (conversation.result) {
            const lastMsg = uiMessages[uiMessages.length - 1];
            if (!(lastMsg && lastMsg.sender === 'ai' && lastMsg.text === conversation.result)) {
              uiMessages.push({ id: `${idToLoad}-result`, text: conversation.result, sender: 'ai', timestamp: new Date(), isTyping: false });
            }
          }
        }
        setMessages(uiMessages);
      } catch (error) {
        console.error('[DEBUG] Failed to load conversation:', error);
      } finally { setIsLoadingConversation(false); }
    };
    loadConversation();
  }, [idToLoad]);

  const placeholderText = 'On brainstorm autour d\'un café ? ☕';
  const hasMessages = messages.length > 0;
  const promptLimit = user?.promptsLimit || 0;
  const promptUsed = user?.promptsUsed || 0;
  const isTextExhausted = isPackCurieux && promptLimit > 0 && promptLimit !== 999999 && promptUsed >= promptLimit;
  const isAnyMessageTyping = messages.some(m => m.isTyping);
  const isInputDisabled = isGenerating || isTextExhausted || isAnyMessageTyping;

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    // const currentImage = selectedImage;
    if (isTextExhausted) { showModal('error', 'Limite atteinte', `Limite atteinte.`); return; }

    const userMsg: Message = { id: Date.now().toString(), text: inputValue.trim(), sender: 'user', timestamp: new Date(), type: 'text' };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue(''); /* setSelectedImage(null); */ setIsGenerating(true);

    try {
      const chatHistory: any[] = [];
      const systemContext = `Identité: Hipster IA, Rôle: Assistant créatif, Cible: ${user?.name || "l'utilisateur"}`;
      chatHistory.push({ role: 'system', content: `Tu es Hipster IA. ${systemContext}. Pas d'emojis, ton professionnel.` });
      messages.forEach((m) => chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      chatHistory.push({ role: 'user', content: userMsg.text });

      const convIdToSend = conversationId || generateConversationId();
      if (!conversationId) setConversationId(convIdToSend);

      let response = await AiService.chat(chatHistory, convIdToSend);

      if (!conversationId && response.conversationId) setConversationId(response.conversationId);
      const content = response.data?.content ?? response.content ?? response.message ?? response;
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: typeof content === 'string' ? content : JSON.stringify(content), sender: 'ai', timestamp: new Date(), isTyping: !!(typeof content === 'string' && content.length > 0), type: 'text' };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('[DEBUG] Free Mode Error:', error);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: 'Erreur lors de la génération.', sender: 'ai', timestamp: new Date(), isTyping: true }]);
    } finally { setIsGenerating(false); useAuthStore.getState().aiRefreshUser().catch(console.error); }
  };

  const copyToClipboard = async (text: string) => { try { await Clipboard.setStringAsync(text); showModal('success', 'Copié !', 'Texte copié.'); } catch (error) { } };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false); if (!conversationId) { resetChat(); return; }
    try { setIsGenerating(true); await AiService.deleteGeneration(conversationId); resetChat(); router.setParams({ chatId: undefined, conversationId: undefined }); } catch (error) { } finally { setIsGenerating(false); }
  };

  const resetChat = () => { clearChatStore(); setInputValue(''); setConversationId(null); };
  const completeTyping = (msgId: string) => setMessages((prev) => prev.map((msg) => (msg.id === msgId ? { ...msg, isTyping: false } : msg)));

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={2}>
      <ScreenHeader
        titleSub="TEXTE"
        titleScript="Libre"
        onBack={() => router.back()}
        scrollY={scrollY}
        renderRight={() => (
          hasMessages ? (
            <TouchableOpacity 
              className="rounded-lg bg-white/5 p-2" 
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={20} color={colors.text.muted} />
            </TouchableOpacity>
          ) : null
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          ref={scrollViewRef as any}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingHorizontal: 20, 
            paddingTop: 120, // Synchronized with other screens
            paddingBottom: 20 
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {!hasMessages ? (
            <View className="mt-5 items-center">
              <Text className="mb-2 text-lg text-slate-500" style={{ fontFamily: fonts.arimo.regular }}>
                {getGreetingByTime()} {user?.name || 'Utilisateur'}
              </Text>
              <Text className="text-center text-2xl font-bold leading-9 text-slate-300" style={{ fontFamily: fonts.arimo.bold }}>
                {"Que créons-nous aujourd'hui ?"}
              </Text>
            </View>
          ) : (
            <View className="space-y-3 pt-5">
              {isLoadingConversation ? (
                <View className="items-center justify-center py-10">
                  <ActivityIndicator size="large" color={colors.primary.main} />
                  <Text className="mt-4 text-slate-400">Chargement...</Text>
                </View>
              ) : (
                <>
                  {messages.map((msg) => (
                    <View key={msg.id} className="max-w-[85%] rounded-2xl border p-4 mt-4" style={msg.sender === 'user' ? { backgroundColor: 'rgba(44, 70, 155, 0.2)', borderColor: 'rgba(44, 70, 155, 0.4)', alignSelf: 'flex-end', borderBottomRightRadius: 4 } : { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                      {/* {msg.type && msg.type !== 'text' && msg.mediaUrl && <MediaDisplay type={msg.type} url={msg.mediaUrl} showModal={showModal} />} */}
                      {msg.sender === 'user' ? (msg.text ? <Text className="text-base leading-6 text-slate-300">{msg.text}</Text> : null) : msg.isTyping ? <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} /> : msg.text ? <Text className="text-base leading-6 text-slate-300">{msg.text}</Text> : null}
                      {msg.sender === 'ai' && !msg.isTyping && (!msg.type || msg.type === 'text') && msg.text && <TouchableOpacity onPress={() => copyToClipboard(msg.text)} className="mt-2 self-end p-1"><Copy size={14} color={colors.text.muted} /></TouchableOpacity>}
                    </View>
                  ))}
                </>
              )}
              {isGenerating && <View className="h-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 p-4"><ActivityIndicator size="small" color={colors.primary.main} /></View>}
            </View>
          )}
        </Animated.ScrollView>

        <View className="px-5" style={{ paddingBottom: insets.bottom + 12 }}>
          {isPaidPlanButInactive ? (
            <PaymentBlocker plan={currentPlanObject} onPay={handleStripePayment} loading={isPaymentLoading} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <ChatInput 
                  inputValue={inputValue} 
                  onChangeText={setInputValue} 
                  /* selectedImage={selectedImage} 
                  onImageSelect={pickImage} 
                  onImageRemove={() => setSelectedImage(null)} */
                  onSend={handleSend} 
                  isGenerating={isGenerating} 
                  isDisabled={isInputDisabled} 
                  placeholderText={placeholderText} 
                  maxLength={500} 
                />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <GenericModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} />
      <GenericModal visible={showDeleteConfirm} type="warning" title="Supprimer la conversation" message="Voulez-vous vraiment supprimer définitivement cette discussion ?" confirmText="Supprimer" cancelText="Annuler" onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteConfirm} />
    </BackgroundGradientOnboarding>
  );
}