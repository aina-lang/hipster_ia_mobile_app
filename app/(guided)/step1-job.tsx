import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, JobType } from '../../store/creationStore';
import {
  Scissors,
  UtensilsCrossed,
  Store,
  Palette,
  Hammer,
  MapPin,
  MoreHorizontal,
} from 'lucide-react-native';

const JOBS: { label: JobType; icon: any }[] = [
  { label: 'Coiffeur', icon: Scissors },
  { label: 'Restaurant', icon: UtensilsCrossed },
  { label: 'Boutique', icon: Store },
  { label: 'Créateur', icon: Palette },
  { label: 'Artisan', icon: Hammer },
  { label: 'Service local', icon: MapPin },
  { label: 'Autre', icon: MoreHorizontal },
];

import { NeonButton } from '../../components/ui/NeonButton';
import { TextInput, Keyboard } from 'react-native';

// ... (existing imports, ensure NeonButton, TextInput are imported)

export default function Step1JobScreen() {
  const router = useRouter();
  const { setJob, selectedJob } = useCreationStore();
  const [customJob, setCustomJob] = React.useState('');
  const [showInput, setShowInput] = React.useState(false);

  const handleSelect = (job: string) => {
    if (job === 'Autre') {
      setShowInput(true);
      setCustomJob('');
      setJob('Autre'); // Temporarily set to Autre to highlight the card
    } else {
      setShowInput(false);
      setJob(job as JobType);
      setTimeout(() => {
        router.push('/(guided)/step2-type');
      }, 300);
    }
  };

  const handleCustomSubmit = () => {
    if (customJob.trim()) {
      setJob(customJob.trim() as JobType);
      router.push('/(guided)/step2-type');
    }
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Quel est votre métier ?</Text>
            <Text style={styles.subtitle}>Nous personnalisons l'expérience pour vous.</Text>
          </View>

          <View style={styles.animationContainer}>
            <DeerAnimation size={120} progress={20} />
          </View>

          <View style={styles.grid}>
            {JOBS.map((job) => (
              <View key={job.label} style={styles.gridItem}>
                <SelectionCard
                  label={job.label}
                  icon={job.icon}
                  selected={selectedJob === job.label || (job.label === 'Autre' && showInput)}
                  onPress={() => handleSelect(job.label)}
                />
              </View>
            ))}
          </View>

          {showInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Précisez votre métier..."
                placeholderTextColor={colors.text.muted}
                value={customJob}
                onChangeText={setCustomJob}
                autoFocus
              />
              <NeonButton
                title="Continuer"
                onPress={handleCustomSubmit}
                disabled={!customJob.trim()}
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
