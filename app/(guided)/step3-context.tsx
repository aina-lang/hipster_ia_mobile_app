import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore } from '../../store/creationStore';
import { WORKFLOWS, WorkflowQuestion } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';

export default function Step3ContextScreen() {
  const router = useRouter();
  const { selectedJob, selectedFunction, workflowAnswers, setWorkflowAnswer } = useCreationStore();

  const questions: WorkflowQuestion[] =
    (selectedJob && selectedFunction && WORKFLOWS[selectedJob]?.[selectedFunction]) || [];

  const handleContinue = () => {
    router.push('/(guided)/step4-create');
  };

  const isFormValid = () => true;

  const renderQuestion = (q: WorkflowQuestion, index: number) => {
    const value = workflowAnswers[q.id];

    return (
      <View key={q.id} className="mb-8">
        <Text className="mb-4 text-xl font-bold text-white">
          {index + 1}. {q.label}
        </Text>

        {q.type === 'choice' && q.options && (
          <View className="flex-row flex-wrap gap-2">
            {q.options.map((opt) => {
              const isSelected = value === opt;

              return (
                <TouchableOpacity
                  key={opt}
                  className={`
                    rounded-2xl border-2 px-5 py-3
                    ${isSelected ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5'}
                  `}
                  onPress={() => setWorkflowAnswer(q.id, opt)}>
                  <Text
                    className={`
                      text-sm font-medium
                      ${isSelected ? 'text-primary' : 'text-white/70'}
                    `}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {q.type === 'text' && (
          <TextInput
            className="
              rounded-2xl border-2
              border-white/10 bg-white/5
              p-5
              text-base text-white
            "
            placeholder={q.placeholder || 'Votre réponse...'}
            placeholderTextColor={colors.text.muted}
            value={value || ''}
            onChangeText={(text) => setWorkflowAnswer(q.id, text)}
          />
        )}
      </View>
    );
  };

  return (
    <GuidedScreenWrapper>
      <View className="px-5">
        {/* Header */}
        <View className="mb-8 mt-2 items-center">
          <Text className="mb-2 text-center text-3xl font-black uppercase tracking-tighter text-white">
            Personalization
          </Text>
          <View className="mb-3 h-1 w-12 rounded-full bg-primary" />
          <Text className="text-center text-base font-medium text-white/50">
            {selectedFunction ? selectedFunction.split('(')[0].trim() : 'Détails du projet'}
          </Text>
        </View>

        {/* Animation */}
        <View className="mb-8 items-center">
          <DeerAnimation size={80} progress={60} />
        </View>

        {/* Questions */}
        {questions.length > 0 ? (
          questions.map((q, index) => renderQuestion(q, index))
        ) : (
          <View className="items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-white/5 p-10">
            <Text className="text-center italic text-white/30">
              Aucune personnalisation nécessaire pour ce choix.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View className="mb-10 mt-4 items-center">
          <NeonButton
            title="Continuer"
            onPress={handleContinue}
            size="lg"
            disabled={!isFormValid()}
          />
        </View>
      </View>
    </GuidedScreenWrapper>
  );
}
