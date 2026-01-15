import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useCreationStore } from '../../store/creationStore';
import { WORKFLOWS, WorkflowQuestion } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { Sparkles, Image as LucideImage, Paperclip, Mic, ChevronRight } from 'lucide-react-native';
import { NeonButton } from '../../components/ui/NeonButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Step2PersonalizeScreen() {
  const router = useRouter();
  const { setQuery, userQuery, selectedJob, selectedFunction, workflowAnswers, setWorkflowAnswer } =
    useCreationStore();

  const [inputText, setInputText] = useState(userQuery);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Fallback to generic if specific not found
  const questions: WorkflowQuestion[] =
    (selectedJob && selectedFunction && WORKFLOWS[selectedJob]?.[selectedFunction]) || [];

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height - 40, // Adjust for bottom bar
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
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
    setQuery(inputText);
    router.push('/(guided)/step3-result');
  };

  const canProceed = inputText.trim().length > 0;

  return (
    <GuidedScreenWrapper>
      <View style={{ flex: 1 }}>
        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 250 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Personnalisez votre création</Text>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbJob}>{selectedJob}</Text>
              <ChevronRight size={14} color={colors.text.muted} />
              <Text style={styles.breadcrumbFunction}>{selectedFunction?.split('(')[0]}</Text>
            </View>
          </View>

          {/* Animation - visible only if no keyboard */}
          {!isKeyboardVisible && (
            <View style={styles.animationContainer}>
              <DeerAnimation size={80} progress={70} />
            </View>
          )}

          {/* Section Questions */}
          {questions.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              {questions.map((q, index) => renderQuestion(q, index))}
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Bar */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 12,

            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.05)',
            gap: 12,
          }}>
          <View className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Décrivez votre contenu en détail..."
              placeholderTextColor={colors.text.muted}
              multiline
              maxLength={500}
              className="mb-3 max-h-[120] min-h-[60] text-base text-white"
              textAlignVertical="top"
            />

            <View className="flex-row items-center justify-between">
              <View className="flex-row gap-3">
                <TouchableOpacity className="rounded-lg bg-white/5 p-2">
                  <LucideImage size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity className="rounded-lg bg-white/5 p-2">
                  <Paperclip size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity className="rounded-lg bg-white/5 p-2">
                  <Mic size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-white/40">{inputText.length}/500</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <NeonButton
                disabled={!canProceed}
                onPress={handleCreate}
                title="Générer avec Hipster•IA"
                variant="primary"
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbJob: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  breadcrumbFunction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.muted,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questionContainer: {
    marginBottom: 24,
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
    gap: 8,
  },
  choiceButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  choiceButtonSelected: {
    borderColor: colors.blue[400],
    backgroundColor: colors.blue[600],
    // Neon glow effect
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textInputActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '0D', // 5% opacity
  },
});
