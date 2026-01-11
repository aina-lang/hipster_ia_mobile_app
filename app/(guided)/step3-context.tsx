import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore, ContextType } from '../../store/creationStore';
import { Gift, Heart, Ribbon, Percent, Sun, Snowflake, MoreHorizontal } from 'lucide-react-native';

const CONTEXTS: { label: ContextType; icon: any }[] = [
  { label: 'Noël', icon: Gift },
  { label: 'Saint-Valentin', icon: Heart },
  { label: 'Octobre Rose', icon: Ribbon },
  { label: 'Soldes', icon: Percent },
  { label: 'Été', icon: Sun },
  { label: 'Hiver', icon: Snowflake },
  { label: 'Autre', icon: MoreHorizontal },
];

import { TextInput } from 'react-native';

export default function Step3ContextScreen() {
  const router = useRouter();
  const { setContext, selectedContext } = useCreationStore();
  const [customContext, setCustomContext] = React.useState('');
  const [showInput, setShowInput] = React.useState(false);

  const handleSelect = (context: string) => {
    if (context === 'Autre') {
      setShowInput(true);
      setCustomContext('');
      setContext('Autre' as ContextType);
    } else {
      setShowInput(false);
      setContext(context as ContextType);
      setTimeout(() => {
        router.push('/(guided)/step4-create');
      }, 300);
    }
  };

  const handleCustomSubmit = () => {
    if (customContext.trim()) {
      setContext(customContext.trim() as ContextType);
      router.push('/(guided)/step4-create');
    }
  };

  const handleSkip = () => {
    setContext(null);
    router.push('/(guided)/step4-create');
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Un contexte particulier ?</Text>
            <Text style={styles.subtitle}>C'est optionnel, mais ça aide !</Text>
          </View>

          <View style={styles.animationContainer}>
            <DeerAnimation size={120} progress={60} />
          </View>

          <View style={styles.grid}>
            {CONTEXTS.map((context) => (
              <View key={context.label!} style={styles.gridItem}>
                <SelectionCard
                  label={context.label!}
                  icon={context.icon}
                  selected={
                    selectedContext === context.label || (context.label === 'Autre' && showInput)
                  }
                  onPress={() => handleSelect(context.label!)}
                />
              </View>
            ))}
          </View>

          {showInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Précisez le contexte..."
                placeholderTextColor={colors.text.muted}
                value={customContext}
                onChangeText={setCustomContext}
                autoFocus
              />
              <NeonButton
                title="Continuer"
                onPress={handleCustomSubmit}
                disabled={!customContext.trim()}
                size="md"
              />
            </View>
          )}

          {!showInput && (
            <View style={styles.skipContainer}>
              <NeonButton
                title="Passer cette étape"
                onPress={handleSkip}
                variant="ghost"
                size="md"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 200,
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
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  skipContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: 24,
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    color: colors.text.primary,
    fontSize: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
