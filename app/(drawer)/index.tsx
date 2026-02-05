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
} from 'lucide-react-native';
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

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { chatId } = useGlobalSearchParams();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: any, title: string, message: string = '') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
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
    if (chatId) {
      // Basic implementation: if we have a chatId, we're coming from history
      // Ideally we'd fetch the specific generation details here.
      console.log('[DEBUG] HomeScreen detected chatId:', chatId);
    }
  }, [chatId]);

  const placeholderText = 'Décrivez votre idée, ajoutez une image ou un audio...';
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

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
        Tone: Amical et professionnel
        Cible: ${user?.lastName || "l'utilisateur"}
        Contexte: ${user?.aiProfile?.companyName ? `Entreprise: ${user.aiProfile.companyName}` : ''}
      `;

      chatHistory.push({ role: 'system', content: `Tu es Hipster IA. ${systemContext}` });

      messages.forEach((m) =>
        chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })
      );

      chatHistory.push({ role: 'user', content: userMsg.text });

      console.log('[DEBUG] Free Mode Chat History:', JSON.stringify(chatHistory, null, 2));

      const response = await AiService.chat(chatHistory);
      console.log('[DEBUG] Free Mode Response:', JSON.stringify(response, null, 2));

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || response.content || response,
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
    <BackgroundGradientOnboarding>
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
            className="flex-1 px-5 pt-12"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {!hasMessages ? (
              <>
                <View className="mt-5 items-center">
                  <Text className="mb-2 text-lg text-white/60">
                    {getGreetingByTime()}{' '}
                    {user?.aiProfile?.companyName || user?.lastName || 'Utilisateur'}
                  </Text>
                  <Text className="text-center text-2xl font-bold leading-9 text-white">
                    {user?.aiProfile?.job ? `Prêt pour votre prochaine création en tant que ${user.aiProfile.job.toLowerCase()} ?` : 'Que créons-nous aujourd\'hui ?'}
                  </Text>
                </View>

                <View className="items-center">
                  <DeerAnimation size={800} progress={0} />
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

                <View className="my-5 flex-row items-center gap-4 opacity-40">
                  <View className="h-px flex-1 bg-white/20" />
                  <Text className="text-xs font-semibold tracking-wider text-white/60">
                    OU MODE LIBRE
                  </Text>
                  <View className="h-px flex-1 bg-white/20" />
                </View>
              </>
            ) : (
              <View className="space-y-3 pt-5">
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    className="max-w-[85%] rounded-2xl border p-4"
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
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
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

                {isGenerating && (
                  <View className="w-15 h-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 p-4">
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Usage Bar */}
          {hasMessages && <UsageBar />}

          {/* Input */}
          <View className="px-5 py-3">
            <View className="relative rounded-2xl border border-white/10 bg-slate-900 p-4">
              <TypingPlaceholder text={placeholderText} inputValue={inputValue} />
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                multiline
                maxLength={500}
                placeholderTextColor="transparent"
                className="mb-3 max-h-[100px] min-h-[24px] text-base text-white"
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
                  disabled={!inputValue.trim() || isGenerating}
                  className="rounded-lg p-3 shadow-lg"
                  style={{
                    backgroundColor: colors.primary.main,
                    opacity: !inputValue.trim() || isGenerating ? 0.4 : 1,
                  }}>
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Send size={20} color={colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
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
