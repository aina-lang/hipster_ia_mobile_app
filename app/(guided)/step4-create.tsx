import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore } from '../../store/creationStore';
import { Keyboard, Sparkles, Plus, Trash2, FileText, User, CreditCard } from 'lucide-react-native';

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  price: string;
}

export default function Step4CreateScreen() {
  const router = useRouter();
  const { setQuery, userQuery, selectedJob, selectedFunction } = useCreationStore();
  const [inputText, setInputText] = useState(userQuery);

  const handleCreate = () => {
    setQuery(inputText);
    router.push('/(guided)/step5-result');
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Détails de la création</Text>
            <Text style={styles.subtitle}>
              Pour votre {selectedFunction?.toLowerCase()} en tant que {selectedJob?.toLowerCase()}.
            </Text>
          </View>

          {!isDocumentMode && (
            <View style={styles.animationContainer}>
              <DeerAnimation size={120} progress={80} />
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Décrivez le document que vous souhaitez générer..."
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={inputText}
                onChangeText={setInputText}
              />
            </View>
            <View style={styles.hintContainer}>
              <Keyboard size={16} color={colors.text.muted} />
              <Text style={styles.hintText}>Astuce : soyez précis pour un meilleur résultat.</Text>
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
    paddingTop: 120,
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
    minHeight: 100,
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
  // Form Styles
  formContainer: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.accent,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.text.primary,
    padding: 12,
    fontSize: 16,
  },
  itemRow: {
    gap: 8,
    marginBottom: 8,
  },
  itemMain: {
    flex: 1,
  },
  itemMetas: {
    flexDirection: 'row',
    gap: 8,
  },
  itemDesc: {
    flex: 1,
  },
  itemQty: {
    width: 60,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
});
