import React, { useEffect } from 'react';
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
  const { selectedJob, selectedFunction, workflowAnswers, setWorkflowAnswer } =
    useCreationStore();

  const questions: WorkflowQuestion[] =
    (selectedJob && selectedFunction && WORKFLOWS[selectedJob]?.[selectedFunction]) || [];

  useEffect(() => {
    if (questions.length === 0 && selectedJob && selectedFunction) {
      // Pas de skip auto ici, mais logique possible si nécessaire
    }
  }, [questions, selectedJob, selectedFunction]);

  const handleContinue = () => {
    router.push('/(guided)/step4-create');
  };

  const isFormValid = () => true;

  const renderQuestion = (q: WorkflowQuestion, index: number) => {
    const value = workflowAnswers[q.id];

    return (
      <View key={q.id} className="mb-6">
        <Text className="text-lg font-semibold text-white mb-3">
          {index + 1}. {q.label}
        </Text>

        {q.type === 'choice' && q.options && (
          <View className="flex-row flex-wrap gap-2">
            {q.options.map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`
                  px-4 py-2 rounded-full border 
                  ${value === opt
                    ? 'bg-primary border-primary'
                    : 'bg-white/5 border-white/10'
                  }
                `}
                onPress={() => setWorkflowAnswer(q.id, opt)}
              >
                <Text
                  className={`
                    text-sm 
                    ${value === opt ? 'text-black font-semibold' : 'text-white/70'}
                  `}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {q.type === 'text' && (
          <TextInput
            className="
              text-white text-base
              p-4 rounded-xl
              bg-black/20
              border border-white/10
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
        <View className="items-center my-5">
          <Text className="text-2xl font-bold text-white text-center mb-2">
            Personnalisation
          </Text>
          <Text className="text-base text-white/70 text-center">
            {selectedFunction ? selectedFunction.split('(')[0].trim() : 'Détails du projet'}
          </Text>
        </View>

        {/* Animation */}
        <View className="items-center mb-5">
          <DeerAnimation size={100} progress={60} />
        </View>

        {/* Questions */}
        {questions.length > 0 ? (
          questions.map((q, index) => renderQuestion(q, index))
        ) : (
          <View className="p-5 items-center">
            <Text className="text-white/50 italic">
              Aucune question spécifique pour ce choix.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View className="mt-6 items-center">
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
