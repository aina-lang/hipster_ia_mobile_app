import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import {
  Keyboard,
  Sparkles,
  FileText,
  User,
  MapPin,
  Briefcase,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react-native';

export default function Step4CreateScreen() {
  const router = useRouter();
  const { setQuery, userQuery, selectedJob, selectedFunction, workflowAnswers } =
    useCreationStore();
  const [inputText, setInputText] = useState(userQuery);

  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientContact, setClientContact] = useState('');

  const [tasks, setTasks] = useState<string[]>(['']);
  const [isQuoteMode, setIsQuoteMode] = useState(false);

  useEffect(() => {
    if (selectedFunction) {
      const lowerFn = selectedFunction.toLowerCase();
      setIsQuoteMode(lowerFn.includes('devis') || lowerFn.includes('estimation'));
    }
  }, [selectedFunction]);

  const getWorkflowSummary = () => {
    if (!workflowAnswers || Object.keys(workflowAnswers).length === 0) return '';
    return Object.values(workflowAnswers).join(' • ');
  };

  const updateTask = (t: string, index: number) => {
    const newTasks = [...tasks];
    newTasks[index] = t;
    setTasks(newTasks);
  };

  const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));
  const addTask = (event: GestureResponderEvent) => setTasks([...tasks, '']);

  const handleCreate = () => {
    if (isQuoteMode) {
      const parts = [
        `CLIENT: ${clientName || 'N/C'}`,
        `SOCIÉTÉ: ${clientCompany || 'N/C'}`,
        `ADRESSE: ${clientAddress || 'N/C'}`,
        `CONTACT: ${clientContact || 'N/C'}`,
        '---',
        'POSTES / TRAVAUX :',
        ...tasks.map((t, i) => `${i + 1}. ${t}`),
      ];
      setQuery(parts.join('\n'));
    } else {
      setQuery(inputText);
    }
    router.push('/(guided)/step5-result');
  };

  return (
    <GuidedScreenWrapper>
      <View className="px-5">

        {/* Header */}
        <View className="items-center my-5">
          <Text className="text-2xl font-bold text-white text-center mb-2">
            Détails de la création
          </Text>
          <Text className="text-base text-white/70 text-center">
            {getWorkflowSummary() ||
              (isQuoteMode
                ? "Informations pour l'estimation"
                : `Pour votre ${selectedFunction?.split('(')[0] || 'projet'}...`)}
          </Text>
        </View>

        {/* Animation */}
        <View className="items-center mb-5">
          <DeerAnimation size={120} progress={80} />
        </View>

        {/* Input Section */}
        <View className="mb-8">
          {isQuoteMode ? (
            <View className="gap-5">

              {/* Client Details */}
              <View className="gap-3">
                <Text className="text-base font-bold text-accent mb-2">Infos du Client</Text>

                {[
                  { value: clientName, setter: setClientName, placeholder: 'Nom et Prénom', Icon: User },
                  { value: clientCompany, setter: setClientCompany, placeholder: 'Entreprise (si applicable)', Icon: Briefcase },
                  { value: clientAddress, setter: setClientAddress, placeholder: 'Adresse complète', Icon: MapPin },
                  { value: clientContact, setter: setClientContact, placeholder: 'Email / Téléphone', Icon: Phone },
                ].map((field, idx) => (
                  <View key={idx} className="relative justify-center">
                    <field.Icon
                      size={18}
                      color={colors.primary.main}
                      className="absolute left-3 z-10"
                    />
                    <TextInput
                      value={field.value}
                      onChangeText={field.setter}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.text.muted}
                      className="bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-base"
                    />
                  </View>
                ))}
              </View>

              {/* Tasks */}
              <View className="gap-2 mt-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <FileText size={18} color={colors.primary.main} />
                  <Text className="text-base font-bold text-accent">Liste des travaux à chiffrer</Text>
                </View>

                <View className="gap-2">
                  {tasks.map((task, index) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <TextInput
                        value={task}
                        onChangeText={(t) => updateTask(t, index)}
                        placeholder={`Tâche ${index + 1} (ex: Peinture plafond)`}
                        placeholderTextColor={colors.text.muted}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 text-white text-base"
                      />
                      {tasks.length > 1 && (
                        <TouchableOpacity onPress={() => removeTask(index)} className="p-2">
                          <Trash2 size={20} color={colors.status.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={addTask}
                  className="flex-row items-center justify-center gap-2 py-3 border border-dashed border-primary rounded-xl mt-2 bg-black/20"
                >
                  <Plus size={18} color={colors.primary.main} />
                  <Text className="text-primary font-semibold text-sm">Ajouter une tâche</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View className="relative bg-white/5 border border-white/10 rounded-2xl">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Décrivez le document que vous souhaitez générer..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="text-white text-base p-4 min-h-[100px]"
                />
              </View>

              <View className="flex-row items-center justify-center gap-2 mt-3">
                <Keyboard size={16} color={colors.text.muted} />
                <Text className="text-white/50 text-sm">
                  Astuce : soyez précis pour un meilleur résultat.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Button */}
        <View className="items-center">
          <NeonButton
            title="Générer avec Hipster•IA"
            onPress={handleCreate}
            icon={<Sparkles size={20} color="#000" />}
            size="lg"
            variant="premium"
          />
        </View>
      </View>
    </GuidedScreenWrapper>
  );
}
