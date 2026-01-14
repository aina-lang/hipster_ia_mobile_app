import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, GestureResponderEvent } from 'react-native';
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
  Image as LucideImage,
  Paperclip,
  Mic,
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
        <View className="my-5 items-center">
          <Text className="mb-2 text-center text-2xl font-bold text-white">
            Détails de la création
          </Text>
          <Text className="text-center text-base text-white/70">
            {getWorkflowSummary() ||
              (isQuoteMode
                ? "Informations pour l'estimation"
                : `Pour votre ${selectedFunction?.split('(')[0] || 'projet'}...`)}
          </Text>
        </View>

        {/* Animation */}
        <View className="mb-5 items-center">
          <DeerAnimation size={120} progress={80} />
        </View>

        {/* Input Section */}
        <View className="mb-8">
          {isQuoteMode ? (
            <View className="gap-5">
              {/* Client Details */}
              <View className="gap-3">
                <Text className="mb-2 text-base font-bold text-accent">Infos du Client</Text>

                {[
                  {
                    value: clientName,
                    setter: setClientName,
                    placeholder: 'Nom et Prénom',
                    Icon: User,
                  },
                  {
                    value: clientCompany,
                    setter: setClientCompany,
                    placeholder: 'Entreprise (si applicable)',
                    Icon: Briefcase,
                  },
                  {
                    value: clientAddress,
                    setter: setClientAddress,
                    placeholder: 'Adresse complète',
                    Icon: MapPin,
                  },
                  {
                    value: clientContact,
                    setter: setClientContact,
                    placeholder: 'Email / Téléphone',
                    Icon: Phone,
                  },
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
                      className="rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-base text-white"
                    />
                  </View>
                ))}
              </View>

              {/* Tasks */}
              <View className="mt-3 gap-2">
                <View className="mb-2 flex-row items-center gap-2">
                  <FileText size={18} color={colors.primary.main} />
                  <Text className="text-base font-bold text-accent">
                    Liste des travaux à chiffrer
                  </Text>
                </View>

                <View className="gap-2">
                  {tasks.map((task, index) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <TextInput
                        value={task}
                        onChangeText={(t) => updateTask(t, index)}
                        placeholder={`Tâche ${index + 1} (ex: Peinture plafond)`}
                        placeholderTextColor={colors.text.muted}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white"
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
                  className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-primary bg-black/20 py-3">
                  <Plus size={18} color={colors.primary.main} />
                  <Text className="text-sm font-semibold text-primary">Ajouter une tâche</Text>
                </TouchableOpacity>

                <View className="mt-4 flex-row items-center border-t border-white/5 pt-4">
                  <View className="flex-row gap-4">
                    <TouchableOpacity className="rounded-lg bg-white/5 p-2" onPress={() => {}}>
                      <LucideImage size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="rounded-lg bg-white/5 p-2" onPress={() => {}}>
                      <Paperclip size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="rounded-lg bg-white/5 p-2" onPress={() => {}}>
                      <Mic size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
              <View className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Décrivez le document que vous souhaitez générer..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="mb-3 min-h-[100px] text-base text-white"
                />

                <View className="flex-row items-center border-t border-white/5 pt-3">
                  <View className="flex-row gap-4">
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
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 12 }}>
                    {(inputText || '').length}/500
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center justify-center gap-2">
                <Keyboard size={16} color={colors.text.muted} />
                <Text className="text-sm text-white/50">
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
