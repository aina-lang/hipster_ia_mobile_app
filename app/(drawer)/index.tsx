import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useAuthStore } from '../../store/authStore';
import {
  Compass,
  Menu,
  Image,
  Paperclip,
  Send,
  Mic,
  Bot,
  User,
  ArrowLeft,
  Copy,
  Trash2,
} from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { api } from '../../api/client';
import { AiService } from '../../api/ai.service';

// --- CHAT INTERFACES & MOCK ---
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
const getMockMessages = (chatId: string): Message[] => {
  return [
    {
      id: '1',
      text: 'Je voudrais créer un post Instagram pour Noël.',
      sender: 'user',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'Absolument ! Quel ton souhaitez-vous adopter ?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ];
};

// --- TYPING COMPONENTS ---
const TypingEffect = ({ text, style, delay = 0 }: { text: string; style: any; delay?: number }) => {
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startTyping = () => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    };

    if (delay > 0) timeout = setTimeout(startTyping, delay);
    else startTyping();

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <Text style={style}>{displayedText}</Text>;
};

// Composant pour placeholder animé
const TypingPlaceholder = ({
  text,
  inputValue,
  style,
  speed = 30,
  delay = 0,
}: {
  text: string;
  inputValue: string;
  style: any;
  speed?: number;
  delay?: number;
}) => {
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    if (inputValue) {
      setDisplayedText('');
      return;
    }

    let timeout: NodeJS.Timeout;

    const startTyping = () => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    };

    if (delay > 0) timeout = setTimeout(startTyping, delay);
    else startTyping();

    return () => clearTimeout(timeout);
  }, [text, inputValue, speed, delay]);

  if (inputValue) return null;

  return (
    <Text style={[style, { paddingRight: 24, position: 'absolute', left: 34, top: 31 }]}>
      {displayedText}
    </Text>
  );
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState('');

  // Placeholder animé
  const placeholderText = 'Décrivez votre idée, ajoutez une image ou un audio...';

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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
      // Map messages to API format
      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      chatHistory.push({ role: 'user', content: userMsg.text });

      const response = await AiService.chat(chatHistory);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || response.content || response, // Flexibility for different endpoints
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue lors de la génération. Vérifiez votre connexion.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    // Clipboard functionality removed to avoid missing dependency error
    console.log('Copy to clipboard:', text);
  };

  const resetChat = () => {
    setMessages([]);
    setInputValue('');
  };

  // Salutation dynamique selon l’heure
  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };
  const greetingText = getGreetingByTime();

  // Animation fade-in pour le texte de bienvenue
  const fade = useSharedValue(0);
  const translateY = useSharedValue(10);

  React.useEffect(() => {
    fade.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.menuButton}>
              <Menu size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {/* Greeting Section */}
            <View style={styles.greetingSection}>
              <Animated.View style={animatedStyle}>
                <TypingEffect text={`${greetingText} ${user?.firstName}`} style={styles.greeting} />
                <TypingEffect
                  text="Que créons-nous aujourd’hui ?"
                  style={styles.question}
                  delay={800}
                />
              </Animated.View>
            </View>

            {/* Deer Animation */}
            <View style={styles.animationContainer}>
              <DeerAnimation size={180} progress={0} />
            </View>

            {/* Mode Selection */}
            <View style={styles.modesContainer}>
              {/* Mode Guidé */}
              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => router.push('/(guided)/step1-job')}
                activeOpacity={0.8}>
                <View style={styles.iconContainer}>
                  <Compass size={32} color={colors.primary.main} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.modeTitle}>Mode Guidé</Text>
                  <Text style={styles.modeDescription}>
                    Laissez-vous accompagner étape par étape pour une création professionnelle.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Mode Libre results / Chat history */}
              {messages.length > 0 && (
                <View style={styles.chatHistoryContainer}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatTitle}>Conversation</Text>
                    <TouchableOpacity onPress={resetChat} style={styles.resetButton}>
                      <Trash2 size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>
                  {messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgBubble,
                        msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                      ]}>
                      <Text style={msg.sender === 'user' ? styles.userMsgText : styles.aiMsgText}>
                        {msg.text}
                      </Text>
                      {msg.sender === 'ai' && (
                        <TouchableOpacity
                          onPress={() => copyToClipboard(msg.text)}
                          style={styles.copyButton}>
                          <Copy size={14} color={colors.text.muted} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {isGenerating && (
                    <View style={[styles.msgBubble, styles.aiBubble, styles.loadingBubble]}>
                      <ActivityIndicator size="small" color={colors.primary.main} />
                    </View>
                  )}
                </View>
              )}

              {/* Mode Libre Input */}
              <View style={styles.freeModeContainer}>
                <View style={styles.separatorContainer}>
                  <View style={styles.separator} />
                  <Text style={styles.separatorText}>OU MODE LIBRE</Text>
                  <View style={styles.separator} />
                </View>

                <View style={styles.inputWrapper}>
                  <TypingPlaceholder
                    text={placeholderText}
                    inputValue={inputValue}
                    style={{ color: colors.text.muted, fontSize: 16 }}
                    speed={30}
                    delay={500}
                  />

                  <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    multiline
                    style={styles.textInput}
                    placeholderTextColor="transparent" // Placeholder handled by component
                  />

                  <View style={styles.actionRow}>
                    <View style={styles.attachmentsRow}>
                      <TouchableOpacity style={styles.iconButton}>
                        <Image size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconButton}>
                        <Paperclip size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconButton}>
                        <Mic size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        (inputValue.trim().length === 0 || isGenerating) &&
                          styles.sendButtonDisabled,
                      ]}
                      onPress={handleSend}
                      disabled={inputValue.trim().length === 0 || isGenerating}>
                      {isGenerating ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Send size={20} color={colors.background.tertiary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-start' },
  menuButton: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  scrollContent: { paddingBottom: 40 },
  greetingSection: { marginTop: 20, paddingHorizontal: 24, alignItems: 'center' },
  greeting: { fontSize: 20, color: colors.text.secondary, marginBottom: 8, textAlign: 'center' },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
  animationContainer: { alignItems: 'center', marginVertical: 40 },
  modesContainer: { paddingHorizontal: 20, gap: 16 },
  modeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { flex: 1 },
  modeTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  modeDescription: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  freeModeContainer: { marginTop: 8 },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
    opacity: 0.4,
  },
  separator: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  separatorText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textInput: {
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 16,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  attachmentsRow: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 10, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  sendButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  sendButtonDisabled: { opacity: 0.4 },
  chatHistoryContainer: {
    marginTop: 8,
    gap: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  chatTitle: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resetButton: {
    padding: 4,
  },
  msgBubble: {
    padding: 16,
    borderRadius: 20,
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.main + '22',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary.main + '44',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userMsgText: {
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 22,
  },
  aiMsgText: {
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 22,
  },
  loadingBubble: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
});
