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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useGlobalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import {
  Compass,
  Menu,
  Image,
  Paperclip,
  Send,
  Mic,
  Copy,
  Trash2,
  Wifi,
  WifiOff,
  Plus,
  CreditCard,
  Lock,
  ChevronRight,
} from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { UsageBar } from '../../components/UsageBar';
import { useAuthStore } from '../../store/authStore';
import { useCreationStore } from '../../store/creationStore';
import { AiService } from '../../api/ai.service';
import { api } from '../../api/client';
import { colors } from '../../theme/colors';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from 'components/ui/BackgroundGradientOnboarding';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const TypingMessage = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 5);
      return () => clearTimeout(timeout);
    } else if (onComplete) onComplete();
  }, [currentIndex, text]);

  return <Text className="text-base leading-6 text-white">{displayedText}</Text>;
};

const TypingPlaceholder = ({ text, inputValue }: { text: string; inputValue: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (inputValue) return setDisplayedText('');

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [text, inputValue]);

  if (inputValue) return null;
  return <Text className="absolute left-4 top-4 text-base text-white/60">{displayedText}</Text>;
};

const PLANS_METADATA = [
  {
    id: 'curieux',
    name: 'Pack Curieux',
    price: '7 jours gratuits',
    stripePriceId: null,
  },
  {
    id: 'atelier',
    name: 'Atelier',
    price: '9,90€ / mois',
    stripePriceId: 'price_Atelier1790',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '29,90€ / mois',
    stripePriceId: 'price_Studio2990',
  },
  {
    id: 'agence',
    name: 'Agence',
    price: '69,99€ / mois',
    stripePriceId: 'price_Agence6990',
  },
];

const PaymentBlocker = ({ planId, onPay, loading }: { planId: string; onPay: () => void; loading: boolean }) => {
  const plan = PLANS_METADATA.find(p => p.id === planId) || PLANS_METADATA[1];

  return (
    <View className=" mb-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl">
      <View className="bg-primary/10 p-6 items-center">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <Lock size={32} color={colors.primary.main} />
        </View>
        <Text className="text-center text-xl font-bold text-white">Action requise</Text>
        <Text className="mt-2 text-center text-sm text-white/60">
          Veuillez finaliser votre abonnement pour débloquer toutes les fonctionnalités de votre plan.
        </Text>
      </View>

      <View className="border-t border-white/5 p-6">
        <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
          <View>
            <Text className="text-xs font-medium text-white/40 uppercase tracking-wider">Plan sélectionné</Text>
            <Text className="mt-1 text-lg font-bold text-white">{plan.name}</Text>
          </View>
          <Text className="text-lg font-black text-primary" style={{ color: colors.primary.main }}>{plan.price}</Text>
        </View>

        <TouchableOpacity
          onPress={onPay}
          disabled={loading}
          activeOpacity={0.8}
          className="flex-row items-center justify-center rounded-2xl bg-primary py-4 px-6 shadow-lg shadow-primary/30"
          style={{ backgroundColor: colors.primary.main }}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <CreditCard size={20} color="#000" className="mr-2" />
              <Text className="text-base font-bold text-black ml-2">Procéder au paiement</Text>
              <ChevronRight size={20} color="#000" className="ml-1" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { chatId, reset } = useGlobalSearchParams();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const planType = user?.aiProfile?.planType || 'curieux';
  const subStatus = user?.aiProfile?.subscriptionStatus;
  const isPaidPlan = planType !== 'curieux';
  const isSubscriptionActive = subStatus === 'active';
  const isPaidPlanButInactive = isPaidPlan && !isSubscriptionActive;

  const showModal = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleStripePayment = async () => {
    const planConfig = PLANS_METADATA.find(p => p.id === planType);
    if (!planConfig || !planConfig.stripePriceId) return;

    setIsPaymentLoading(true);
    try {
      const resp = await api.post(`/ai/payment/create-payment-sheet`, {
        priceId: planConfig.stripePriceId,
        userId: user?.id,
      });

      const data = resp.data?.data ?? resp.data ?? resp;
      const paymentIntentClientSecret = data.paymentIntentClientSecret || data.clientSecret || data.paymentIntent?.client_secret;
      const customerEphemeralKey = data.ephemeralKey || data.customer_ephemeral_key;
      const customerId = data.customerId || data.customer || data.customer_id;

      if (!paymentIntentClientSecret) {
        throw new Error('Impossible de récupérer le client secret.');
      }

      const initResult = await initPaymentSheet({
        paymentIntentClientSecret,
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
      await api.post('/ai/payment/confirm-plan', { planId: planType });

      // Update local store
      await useAuthStore.getState().updateAiProfile({
        subscriptionStatus: 'active' as any
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
  const promptLimit = user?.aiProfile?.aiCreditLimits?.promptsLimit || 0;
  const promptUsed = user?.aiProfile?.aiCreditUsage?.promptsUsed || 0;
  const isPackCurieux = planType === 'curieux';

  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const messageLimit = isPackCurieux ? 10 : Infinity;
  const messagesRemaining = messageLimit - userMessageCount;

  const isMessageLimitReached = isPackCurieux && userMessageCount >= 10;
  // Trigger credit exhaustion ONLY if we have a valid limit > 0 and usage >= limit
  const isCreditsExhausted = promptLimit > 0 && promptUsed >= promptLimit && promptLimit !== 999999;
  const isInputDisabled = isCreditsExhausted || isMessageLimitReached;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    // Check credits
    if (isCreditsExhausted) {
      showModal('error', 'Crédits épuisés', 'Vous avez fini vos crédits. Veuillez recharger pour continuer.');
      return;
    }

    // Check Pack Curieux message limit
    if (isMessageLimitReached) {
      showModal('info', 'Limite atteinte', 'Limite de 10 messages atteinte pour cette conversation.\nDémarrez une nouvelle conversation pour continuer.');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);

    try {
      const chatHistory = [];
      const systemContext = `
        Identité: Hipster IA
        Rôle: Assistant créatif et intelligent
        Cible: ${user?.name || "l'utilisateur"}
        Contexte: ${user?.type !== 'ai' && user?.aiProfile?.job ? `Métier: ${user.aiProfile.job}` : ''}
      `;

      chatHistory.push({ role: 'system', content: `Tu es Hipster IA. ${systemContext}` });

      messages.forEach((m) =>
        chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })
      );

      chatHistory.push({ role: 'user', content: userMsg.text });

      console.log('[DEBUG] Free Mode Chat History:', JSON.stringify(chatHistory, null, 2));
      console.log('[DEBUG] Conversation ID:', conversationId);

      const response = await AiService.chat(chatHistory, conversationId);
      console.log('[DEBUG] Free Mode Response:', JSON.stringify(response, null, 2));

      // Store conversation ID for subsequent messages
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
        console.log('[DEBUG] New conversation started:', response.conversationId);
      }

      // Handle nested response structure
      const content = response.data?.content || response.content || response.message || response;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: typeof content === 'string' ? content : JSON.stringify(content),
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true,
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
    }
  };

  const copyToClipboard = (text: string) => {
    // implement clipboard logic
  };

  const resetChat = () => {
    setMessages([]);
    setInputValue('');
    setConversationId(null); // Start a new conversation
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
      <SafeAreaView className="flex-1" >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <View className="flex-row items-center justify-between px-5 py-2">
            <TouchableOpacity
              className="rounded-lg bg-white/5 p-2"
              onPress={() => navigation.openDrawer()}>
              <Menu size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                className="flex-row items-center gap-2 rounded-xl bg-white/5 py-2 px-3 border border-white/10"
                onPress={resetChat}>
                <Plus size={18} color={colors.primary.main} />
                <Text className="text-white font-medium text-sm">Nouveau</Text>
              </TouchableOpacity>

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
                    {user?.name || 'Utilisateur'}
                  </Text>
                  <Text className="text-center text-2xl font-bold leading-9 text-white">
                    {user?.aiProfile?.job ? `Prêt pour votre prochaine création en tant que ${user.aiProfile.job.toLowerCase()} ?` : 'Que créons-nous aujourd\'hui ?'}
                  </Text>
                </View>


                <TouchableOpacity
                  className="bg-white/3 z-50 mt-80 mb-5 flex-row items-center gap-4 rounded-2xl border border-white/5 p-5"
                  onPress={() => {
                    useCreationStore.getState().reset();
                    // If user already has a non-free plan, go straight to guided flow
                    const userPlan = user?.aiProfile?.planType;
                    if (userPlan && userPlan !== 'curieux') {
                      router.push('/(guided)/step1-job');
                      return;
                    }

                    // Otherwise, ask to choose a plan first
                    router.push('/(drawer)/subscription');
                  }}
                  activeOpacity={0.8}>
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
                        {msg.sender === 'user' ? (
                          <Text className="text-base leading-6 text-white">{msg.text}</Text>
                        ) : msg.isTyping ? (
                          <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} />
                        ) : (
                          <Text className="text-base leading-6 text-white">{msg.text}</Text>
                        )}

                        {msg.sender === 'ai' && !msg.isTyping && (
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
          <View className="px-5 py-3 pt-0">
            {/* Limit warnings */}
            {isMessageLimitReached && (
              <View className="mb-3 rounded-xl bg-orange-500/20 border border-orange-500/40 p-4">
                <Text className="text-sm text-orange-200 font-medium mb-2">
                  Limite de 10 messages atteinte pour cette conversation.
                </Text>
                <TouchableOpacity
                  onPress={resetChat}
                  className="mt-2 rounded-lg bg-orange-500 py-2 px-4 self-start">
                  <Text className="text-white font-semibold">Démarrer une nouvelle conversation</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* {isCreditsExhausted && (
              <View className="mb-3 rounded-xl bg-red-500/20 border border-red-500/40 p-4">
                <Text className="text-sm text-red-200 font-medium">
                  Vous avez fini vos crédits. Veuillez recharger pour continuer.
                </Text>
              </View>
            )} */}

            {/* Message counter for Pack Curieux */}
            {isPackCurieux && !isMessageLimitReached && hasMessages && (
              <Text className="text-xs text-white/60 text-center mb-2">
                {messagesRemaining} message{messagesRemaining > 1 ? 's' : ''} restant{messagesRemaining > 1 ? 's' : ''} dans cette conversation
              </Text>
            )}

            {isPaidPlanButInactive ? (
              <PaymentBlocker
                planId={planType}
                onPay={handleStripePayment}
                loading={isPaymentLoading}
              />
            ) : (
              <View className="relative rounded-2xl border border-white/10 bg-slate-900 p-4">
                <TypingPlaceholder text={placeholderText} inputValue={inputValue} />
                <TextInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  multiline
                  maxLength={500}
                  placeholderTextColor="transparent"
                  className="mb-3 max-h-[100px] min-h-[24px] text-base text-white"
                  editable={!isInputDisabled}
                />

                <View className="flex-row items-center justify-between">
                  <View className="flex-row gap-3">
                    <TouchableOpacity className="rounded-lg bg-white/5 p-2">
                      <Image size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="rounded-lg bg-white/5 p-2">
                      <Paperclip size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="rounded-lg bg-white/5 p-2">
                      <Mic size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={!inputValue.trim() || isGenerating || isInputDisabled}
                    className="rounded-lg p-3 shadow-lg"
                    style={{
                      backgroundColor: colors.primary.main,
                      opacity: (!inputValue.trim() || isGenerating || isInputDisabled) ? 0.4 : 1,
                    }}>
                    {isGenerating ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Send size={20} color={colors.text.secondary} />
                    )}
                  </TouchableOpacity>
                </View>
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
    </BackgroundGradientOnboarding>
  );
}
