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
  Heart,
  Zap,
} from 'lucide-react-native';

const JOBS: { label: JobType; icon: any }[] = [
  { label: 'Artisan', icon: Hammer },
  { label: 'Coiffeur / Barber', icon: Scissors },
  { label: 'Restaurant / Snack', icon: UtensilsCrossed },
  { label: 'Boutique', icon: Store },
  { label: 'Agent Immobilier', icon: MapPin },
  { label: 'Coach / Consultant', icon: Heart },
  { label: 'E-commerce', icon: Zap },
  { label: 'Créateur de contenu', icon: Palette },
  { label: 'Service local', icon: MapPin },
];

export default function Step1JobScreen() {
  const router = useRouter();
  const { setJob, selectedJob } = useCreationStore();

  const handleSelect = (job: string) => {
    setJob(job as JobType);
    setTimeout(() => {
      router.push('/(guided)/step2-type');
    }, 300);
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
                  selected={selectedJob === job.label}
                  onPress={() => handleSelect(job.label)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 100,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
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
});
