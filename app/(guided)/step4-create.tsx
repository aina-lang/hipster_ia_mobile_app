import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore } from '../../store/creationStore';
import { Mic, MicOff, Keyboard, Sparkles } from 'lucide-react-native';

export default function Step4CreateScreen() {
  const router = useRouter();
  const { setQuery, userQuery, isDictating, setDictating, selectedJob, selectedType } =
    useCreationStore();
  const [inputText, setInputText] = useState(userQuery);

  const handleCreate = () => {
    setQuery(inputText);
    router.push('/(guided)/step5-result');
  };

  const toggleDictation = () => {
    // This is a simulation since we don't have real dictation API in this environment
    setDictating(!isDictating);
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Décrivez votre idée</Text>
            <Text style={styles.subtitle}>
              Pour votre {selectedType?.toLowerCase()} de {selectedJob?.toLowerCase()}.
            </Text>
          </View>

          <View style={styles.animationContainer}>
            <DeerAnimation size={120} progress={80} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Ex: Une promotion de -20% sur les coupes hommes pour la Saint-Valentin..."
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity style={styles.micButton} onPress={toggleDictation}>
                {isDictating ? (
                  <MicOff size={24} color={colors.status.error} />
                ) : (
                  <Mic size={24} color={colors.primary.main} />
                )}
              </TouchableOpacity>
            </View>

            {isDictating && <Text style={styles.dictationHint}>Écoute en cours... (Simulé)</Text>}

            <View style={styles.hintContainer}>
              <Keyboard size={16} color={colors.text.muted} />
              <Text style={styles.hintText}>
                Astuce : appuie sur le micro de ton clavier pour dicter.
              </Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <NeonButton
              title="Générer avec Hipster•IA"
              onPress={handleCreate}
              icon={<Sparkles size={20} color="#000" />}
              size="lg"
              variant="premium"
            />
          </View>
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  textAreaWrapper: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    color: colors.text.primary,
    fontSize: 16,
    padding: 16,
    paddingRight: 50, // Space for mic
    minHeight: 150,
  },
  micButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  dictationHint: {
    color: colors.status.success,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  hintText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  actionContainer: {
    alignItems: 'center',
  },
});
