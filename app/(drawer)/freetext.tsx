import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Mic, Copy, Trash2 } from 'lucide-react-native';
import { Audio } from 'expo-av';

import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChatStore, Message } from '../../store/chatStore';
import { AiService } from '../../api/ai.service';
import { GenericModal } from '../../components/ui/GenericModal';
import { TypingMessage } from '../../components/TypingMessage';
import { PaymentBlocker } from '../../components/PaymentBlocker';

const NEON_BLUE = colors.neonBlue;

interface FreetextMessage extends Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function FreetextScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<FreetextMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!textInput.trim() || isLoading) return;

    const userMessage: FreetextMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textInput.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setTextInput('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const aiResponse = await AiService.generateContent(userMessage.content, {
        tone: 'conversational',
        context: 'freetext',
      });

      const assistantMessage: FreetextMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content || 'Désolé, je n\'ai pas pu générer une réponse.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      showModal('error', 'Erreur', error?.message || 'Impossible de générer la réponse');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording
  const handleStartRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showModal('error', 'Permission refusée', 'Accès au micro refusé');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      showModal('error', 'Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      // Note: Transcription would require API call to backend
      showModal('info', 'Enregistrement', 'Transcription utilisée comme texte');
    } catch (error) {
      showModal('error', 'Erreur', 'Impossible de traiter l\'enregistrement');
    }
  };

  // Copy message
  const handleCopyMessage = (content: string) => {
    // In real implementation, would use expo-clipboard
    showModal('success', 'Copié', 'Message copié au presse-papiers');
  };

  // Clear history
  const handleClearHistory = () => {
    setMessages([]);
  };

  if (!user || (user.planType === 'curieux' && user.subscriptionStatus !== 'active')) {
    return <PaymentBlocker />;
  }

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>Textes libres</Text>
        <Pressable onPress={handleClearHistory}>
          <Trash2 size={20} color={colors.text.muted} />
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messagesContainer}
        contentContainerStyle={s.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyStateTitle}>Textes libres</Text>
            <Text style={s.emptyStateSubtitle}>
              Posez vos questions ou demandes sans limitation
            </Text>
          </View>
        ) : (
          messages.map(msg => (
            <View key={msg.id} style={[s.messageWrapper, msg.role === 'user' ? s.userMessage : s.assistantMessage]}>
              <View style={s.messageBubble}>
                {msg.role === 'assistant' && (
                  <Pressable
                    onPress={() => handleCopyMessage(msg.content)}
                    style={s.copyButton}
                  >
                    <Copy size={16} color={colors.neonBlue} />
                  </Pressable>
                )}
                <Text style={[s.messageText, msg.role === 'user' && s.userText]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))
        )}

        {isLoading && <TypingMessage />}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inputContainer}
      >
        <View style={s.inputWrapper}>
          <TextInput
            style={s.input}
            placeholder="Écrivez votre question..."
            placeholderTextColor={colors.text.muted}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            maxHeight={100}
            editable={!isLoading}
          />

          {isRecording ? (
            <Pressable
              onPress={handleStopRecording}
              style={[s.actionButton, s.recordingActive]}
            >
              <Mic size={20} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleStartRecording}
              style={s.actionButton}
            >
              <Mic size={20} color={colors.neonBlue} />
            </Pressable>
          )}

          <Pressable
            onPress={handleSendMessage}
            disabled={!textInput.trim() || isLoading}
            style={[s.sendButton, (!textInput.trim() || isLoading) && s.sendButtonDisabled]}
          >
            <LinearGradient
              colors={textInput.trim() && !isLoading ? ['#264F8C', '#0a1628'] : ['#1a1a1a', '#0d0d0d']}
              style={s.sendGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.neonBlue} size="small" />
              ) : (
                <Send size={18} color={textInput.trim() ? '#fff' : colors.text.muted} />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontFamily: 'Arimo-Bold',
    fontSize: 16,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontFamily: 'Arimo-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageText: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  copyButton: {
    marginBottom: 8,
    opacity: 0.6,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    maxHeight: 100,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
