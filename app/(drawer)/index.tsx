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
import { useRouter } from 'expo-router';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import {
  Compass,
  Menu,
  Image,
  Paperclip,
  Send,
  Mic,
  Copy,
  Trash2,
} from 'lucide-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useAuthStore } from '../../store/authStore';
import { AiService } from '../../api/ai.service';
import { colors } from '../../theme/colors';

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

  return <Text className="text-white text-base leading-6">{displayedText}</Text>;
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
  return <Text className="absolute left-4 top-4 text-white/60 text-base">{displayedText}</Text>;
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
        Cible: ${user?.firstName || "l'utilisateur"}
        Contexte: ${user?.aiProfile?.companyName ? `Entreprise: ${user.aiProfile.companyName}` : ''}
      `;

      chatHistory.push({ role: 'system', content: `Tu es Hipster IA. ${systemContext}` });

      messages.forEach((m) =>
        chatHistory.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })
      );

      chatHistory.push({ role: 'user', content: userMsg.text });

      const response = await AiService.chat(chatHistory);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || response.content || response,
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
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
    <BackgroundGradient>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 py-2">
            <TouchableOpacity
              className="p-2 bg-white/5 rounded-lg"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Menu size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {hasMessages && (
              <TouchableOpacity className="p-2 bg-white/5 rounded-lg" onPress={resetChat}>
                <Trash2 size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Chat / Welcome */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-5 pt-2"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {!hasMessages ? (
              <>
                <View className="mt-5 items-center">
                  <Text className="text-white/60 text-lg mb-2">
                    {getGreetingByTime()}{' '}
                    {user?.aiProfile?.profileType === 'entreprise'
                      ? user.aiProfile.companyName || 'Entreprise'
                      : user?.firstName || 'Utilisateur'}
                  </Text>
                  <Text className="text-white text-2xl font-bold text-center leading-9">
                    Que créons-nous aujourd'hui ?
                  </Text>
                </View>

                <View className="my-10 items-center">
                  <DeerAnimation size={180} progress={0} />
                </View>

                <TouchableOpacity
                  className="bg-white/3 border border-white/5 rounded-2xl p-5 flex-row items-center gap-4 mb-5"
                  onPress={() => router.push('/(guided)/step1-job')}
                  activeOpacity={0.8}>
                  <View className="w-15 h-15 rounded-lg justify-center items-center">
                    <Compass size={32} color={colors.primary.main} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">Mode Guidé</Text>
                    <Text className="text-white/60 text-sm leading-5">
                      Laissez-vous accompagner étape par étape pour une création professionnelle.
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="flex-row items-center my-5 gap-4 opacity-40">
                  <View className="flex-1 h-px bg-white/20" />
                  <Text className="text-white/60 text-xs font-semibold tracking-wider">
                    OU MODE LIBRE
                  </Text>
                  <View className="flex-1 h-px bg-white/20" />
                </View>
              </>
            ) : (
              <View className="space-y-3 pt-5">
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    className={`p-4 rounded-2xl max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'self-end bg-primary-main/20 border border-primary-main/40 rounded-br-sm'
                        : 'self-start bg-white/5 border border-white/10 rounded-bl-sm'
                    }`}>
                    {msg.sender === 'user' ? (
                      <Text className="text-white text-base leading-6">{msg.text}</Text>
                    ) : msg.isTyping ? (
                      <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} />
                    ) : (
                      <Text className="text-white text-base leading-6">{msg.text}</Text>
                    )}

                    {msg.sender === 'ai' && !msg.isTyping && (
                      <TouchableOpacity
                        onPress={() => copyToClipboard(msg.text)}
                        className="self-end mt-2 p-1">
                        <Copy size={14} color={colors.text.muted} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {isGenerating && (
                  <View className="self-start p-4 rounded-2xl bg-white/5 border border-white/10 w-15 h-11 justify-center items-center">
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="px-5 py-3 absolute bottom-0 left-0 right-0">
            <View className="bg-slate-900 rounded-2xl p-4 border border-white/10 relative">
              <TypingPlaceholder text={placeholderText} inputValue={inputValue} />
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                multiline
                maxLength={500}
                placeholderTextColor="transparent"
                className="text-white text-base min-h-[24px] max-h-[100px] mb-3"
              />

              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-3">
                  <TouchableOpacity className="p-2 bg-white/5 rounded-lg">
                    <Image size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2 bg-white/5 rounded-lg">
                    <Paperclip size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2 bg-white/5 rounded-lg">
                    <Mic size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!inputValue.trim() || isGenerating}
                  className={`p-3 rounded-lg ${
                    !inputValue.trim() || isGenerating
                      ? 'opacity-40 bg-primary-main'
                      : 'bg-primary-main shadow-lg'
                  }`}>
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Send size={20} color={colors.background.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}
