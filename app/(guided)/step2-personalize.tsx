import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useCreationStore } from '../../store/creationStore';
import { WORKFLOWS, WorkflowQuestion } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { Sparkles, ChevronRight, Mic, Image as LucideImage, Paperclip } from 'lucide-react-native';
import { NeonButton } from '../../components/ui/NeonButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Step2PersonalizeScreen() {
  const router = useRouter();
  const { selectedJob, selectedFunction, workflowAnswers, setWorkflowAnswer, userQuery, setQuery } =
    useCreationStore();

  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Fallback to generic if specific not found
  const questions: WorkflowQuestion[] =
    (selectedJob && selectedFunction && WORKFLOWS[selectedJob]?.[selectedFunction]) || [];

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height - 40,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();

        // scroll to bottom when keyboard opens
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const renderQuestion = (q: WorkflowQuestion, index: number) => {
    const value = workflowAnswers[q.id];

    return (
      <View key={q.id} style={styles.questionContainer}>
        <Text style={styles.questionLabel}>
          {index + 1}. {q.label}
        </Text>

        {q.type === 'choice' && q.options && (
          <View style={styles.choicesGrid}>
            {q.options.map((opt) => {
              const isSelected = value === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}
                  onPress={() => setWorkflowAnswer(q.id, opt)}
                  activeOpacity={0.7}>
                  <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {q.type === 'text' && (
          <TextInput
            style={[styles.textInput, value ? styles.textInputActive : null]}
            placeholder={q.placeholder || 'Votre réponse...'}
            placeholderTextColor={colors.text.muted}
            value={value || ''}
            onChangeText={(text) => setWorkflowAnswer(q.id, text)}
          />
        )}
      </View>
    );
  };

  const handleCreate = () => {
    router.push('/(guided)/step3-result');
  };

  return (
    <GuidedScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View >
          <ScrollView
            ref={scrollRef}

            contentContainerStyle={{ paddingHorizontal: 20, }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Personnalisez votre création</Text>
              <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbJob}>{selectedJob}</Text>
                <ChevronRight size={14} color={colors.text.muted} />
                <Text style={styles.breadcrumbFunction}>{selectedFunction?.split('(')[0]}</Text>
              </View>
            </View>

            {/* Animation - visible seulement si clavier fermé */}
            {!isKeyboardVisible && (
              <View style={styles.animationContainer}>
                <DeerAnimation size={80} progress={70} />
              </View>
            )}

            {/* Questions */}
            {questions.length > 0 && (
              <View style={{ marginBottom: 32 }}>
                {questions.map((q, index) => renderQuestion(q, index))}
              </View>
            )}
          </ScrollView>

          {/* Input & Button fixe */}
          <Animated.View
            style={{

              paddingHorizontal: 16,
              paddingTop: 12,

              gap: 12,
            }}
          >
            <View style={styles.questionContainer}>
              <Text style={styles.questionLabel}>Votre demande / Détails</Text>
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={[styles.chatTextInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Décrivez ce que vous voulez générer..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={userQuery}
                  onChangeText={(text) => {
                    setQuery(text);
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }}
                  multiline
                />
                <View style={styles.chatActionsRow}>
                  <View style={styles.chatIconsGroup}>
                    <TouchableOpacity style={styles.chatIconButton}>
                      <LucideImage size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatIconButton}>
                      <Paperclip size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatIconButton}>
                      <Mic size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <NeonButton
                  onPress={handleCreate}
                  title="Générer avec Hipster•IA"
                  variant="premium"
                  size="lg"
                  icon={<Sparkles size={18} color={colors.text.primary} />}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbJob: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breadcrumbFunction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionContainer: {
    marginBottom: 28,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceButton: {
    minWidth: '30%',
    maxWidth: '48%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceButtonSelected: {
    borderColor: colors.blue[400],
    backgroundColor: colors.blue[600],
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  choiceTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textInputActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '0D',
  },
  chatInputContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    marginTop: 10,
  },
  chatTextInput: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chatActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatIconsGroup: {
    flexDirection: 'row',
    gap: 14,
  },
  chatIconButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
