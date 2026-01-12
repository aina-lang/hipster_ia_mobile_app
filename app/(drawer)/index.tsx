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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useAuthStore } from '../../store/authStore';
import { Compass, Menu, Image, Paperclip, Send, Mic, Copy, Trash2 } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { AiService } from '../../api/ai.service';
import { encodeToon, extractToonBlocks, containsToon } from '../../utils/toon';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

// Composant pour l'effet de typing des messages AI
const TypingMessage = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 1);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text]);

  if (containsToon(displayedText)) {
    return <ToonRenderer text={displayedText} />;
  }

  return <Text style={styles.aiMsgText}>{displayedText}</Text>;
};

const ToonRenderer = ({ text }: { text: string }) => {
  const blocks = extractToonBlocks(text);

  if (blocks.length === 0) {
    return <Text style={styles.aiMsgText}>{text}</Text>;
  }

  return (
    <View style={styles.toonContainer}>
      {text.split('\n').map((line, i) => {
        const isToonLine = blocks.some((block) => block.includes(line));
        if (isToonLine && containsToon(line)) {
          // It's a TOON header, we could style it
          return (
            <Text key={i} style={styles.toonHeader}>
              {line}
            </Text>
          );
        }
        if (isToonLine && line.includes(',')) {
          // It's a TOON data row
          return (
            <View key={i} style={styles.toonRow}>
              {line.split(',').map((val, j) => (
                <View key={j} style={styles.toonCell}>
                  <Text style={styles.toonCellText}>{val.trim()}</Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={styles.aiMsgText}>
            {line}
          </Text>
        );
      })}
    </View>
  );
};

// Composant pour placeholder animé
const TypingPlaceholder = ({ text, inputValue }: { text: string; inputValue: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (inputValue) {
      setDisplayedText('');
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, inputValue]);

  if (inputValue) return null;

  return <Text style={styles.placeholderText}>{displayedText}</Text>;
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const placeholderText = 'Décrivez votre idée, ajoutez une image ou un audio...';

  // Auto-scroll quand nouveau message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
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

    // Ajouter un message temporaire pour le typing effect
    const tempAiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true,
    };

    try {
      const chatHistory = [];

      const toonPrompt = encodeToon({
        system: {
          identity: 'Hipster IA',
          role: 'Assistant créatif et intelligent expert en design, marketing et création de contenu',
          tone: 'Amical et professionnel',
          target: user?.firstName || "l'utilisateur",
        },
        context: {
          user:
            user?.aiProfile?.profileType === 'entreprise'
              ? {
                  type: 'entreprise',
                  name: user.aiProfile.companyName,
                  email: user.aiProfile.professionalEmail,
                  web: user.aiProfile.websiteUrl,
                }
              : { type: 'particulier', firstName: user?.firstName, lastName: user?.lastName },
        },
        instructions: [
          "Aide l'utilisateur dans ses tâches créatives.",
          "Mentionne son nom/entreprise quand c'est pertinent.",
          'Pour les listes, idées, ou données tabulaires, UTILISE TOUJOURS LE FORMAT TOON (Token-Oriented Object Notation) pour économiser des tokens.',
          'Format TOON: header[N]{fields}:\\n  val1,val2... (Exemple: posts[2]{titre,canal}:\\n  Titre1,Instagram\\n  Titre2,Facebook)',
        ],
      });

      chatHistory.push({
        role: 'system',
        content: `Tu es Hipster IA. Voici ta configuration et ton contexte en format TOON (Token-Oriented Object Notation) pour plus d'efficacité :\n${toonPrompt}\n\nRéponds aux demandes de l'utilisateur de manière amicale.`,
      });

      // Map existing messages
      messages.forEach((m) => {
        chatHistory.push({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        });
      });

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
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue lors de la génération.',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    console.log('Copy to clipboard:', text);
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

  const hasMessages = messages.length > 0;

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.menuButton}>
              <Menu size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {hasMessages && (
              <TouchableOpacity onPress={resetChat} style={styles.resetButton}>
                <Trash2 size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* ScrollView pour les messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {!hasMessages ? (
              <>
                {/* Section d'accueil */}
                <View style={styles.welcomeSection}>
                  <Text style={styles.greeting}>
                    {getGreetingByTime()}{' '}
                    {user?.aiProfile?.profileType === 'entreprise'
                      ? user.aiProfile.companyName || 'Entreprise'
                      : user?.firstName || 'Utilisateur'}
                  </Text>
                  <Text style={styles.question}>Que créons-nous aujourd'hui ?</Text>
                </View>

                {/* Animation */}
                <View style={styles.animationContainer}>
                  <DeerAnimation size={180} progress={0} />
                </View>

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

                {/* Séparateur */}
                <View style={styles.separatorContainer}>
                  <View style={styles.separator} />
                  <Text style={styles.separatorText}>OU MODE LIBRE</Text>
                  <View style={styles.separator} />
                </View>
              </>
            ) : (
              <>
                {/* Messages */}
                <View style={styles.chatMessages}>
                  {messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgBubble,
                        msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                      ]}>
                      {msg.sender === 'user' ? (
                        <Text style={styles.userMsgText}>{msg.text}</Text>
                      ) : msg.isTyping ? (
                        <TypingMessage text={msg.text} onComplete={() => completeTyping(msg.id)} />
                      ) : containsToon(msg.text) ? (
                        <ToonRenderer text={msg.text} />
                      ) : (
                        <Text style={styles.aiMsgText}>{msg.text}</Text>
                      )}
                      {msg.sender === 'ai' && !msg.isTyping && (
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
              </>
            )}
          </ScrollView>

          {/* Input fixe en bas */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TypingPlaceholder text={placeholderText} inputValue={inputValue} />

              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                multiline
                style={styles.textInput}
                placeholderTextColor="transparent"
                maxLength={500}
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
                    (!inputValue.trim() || isGenerating) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!inputValue.trim() || isGenerating}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  modeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 16,
    opacity: 0.4,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  separatorText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  chatMessages: {
    gap: 12,
    paddingTop: 20,
  },
  msgBubble: {
    padding: 16,
    borderRadius: 20,
    maxWidth: '85%',
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
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholderText: {
    position: 'absolute',
    left: 16,
    top: 16,
    color: colors.text.muted,
    fontSize: 16,
    pointerEvents: 'none',
  },
  textInput: {
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 24,
    maxHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
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
  sendButtonDisabled: {
    opacity: 0.4,
  },
  toonContainer: {
    marginVertical: 8,
    gap: 4,
  },
  toonHeader: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toonRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toonCell: {
    flex: 1,
  },
  toonCellText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});
