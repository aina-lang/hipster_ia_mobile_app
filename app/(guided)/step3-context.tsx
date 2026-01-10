import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCreationStore, ContextType } from '../../store/creationStore';
import { Gift, Heart, Ribbon, Percent, Sun, Snowflake } from 'lucide-react-native';

const CONTEXTS: { label: ContextType; icon: any }[] = [
  { label: 'Noël', icon: Gift },
  { label: 'Saint-Valentin', icon: Heart },
  { label: 'Octobre Rose', icon: Ribbon },
  { label: 'Soldes', icon: Percent },
  { label: 'Été', icon: Sun },
  { label: 'Hiver', icon: Snowflake },
];

export default function Step3ContextScreen() {
  const router = useRouter();
  const { setContext, selectedContext } = useCreationStore();

  const handleSelect = (context: ContextType) => {
    setContext(context);
    setTimeout(() => {
      router.push('/(guided)/step4-create');
    }, 300);
  };

  const handleSkip = () => {
    setContext(null);
    router.push('/(guided)/step4-create');
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
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
                  selected={selectedContext === context.label}
                  onPress={() => handleSelect(context.label)}
                />
              </View>
            ))}
          </View>

          <View style={styles.skipContainer}>
            <NeonButton
              title="Passer cette étape"
              onPress={handleSkip}
              variant="secondary"
              size="md"
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
});
