import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { JobType } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import {
  Scissors,
  UtensilsCrossed,
  Store,
  Hammer,
  MapPin,
  Briefcase,
  Leaf,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

const JOBS: { label: JobType; icon: any }[] = [
  { label: 'Coiffure & Esthétique', icon: Scissors },
  { label: 'Restaurant / Bar', icon: UtensilsCrossed },
  { label: 'Commerce / Boutique', icon: Store },
  { label: 'Artisans du bâtiment', icon: Hammer },
  { label: 'Service local', icon: MapPin },
  { label: 'Profession libérale', icon: Briefcase },
  { label: 'Bien-être / Santé alternative', icon: Leaf },
  { label: 'Autre', icon: Plus },
];

export default function OnboardingJobScreen() {
  const router = useRouter();
  const { user, updateAiProfile } = useAuthStore();
  const [selectedJob, setSelectedJob] = useState<JobType | null>(user?.job as JobType || null);
  const [customJob, setCustomJob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomSelected = selectedJob === 'Autre';

  const handleNext = async () => {
    const jobToSave = isCustomSelected ? customJob : selectedJob;
    if (!jobToSave) return;

    setIsSubmitting(true);
    try {
      await updateAiProfile({ job: jobToSave });
      router.push('/(onboarding)/branding');
    } catch (error) {
      console.error('[OnboardingJob] Failed to save job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Quel est votre métier ?</Text>
            <Text style={styles.subtitle}>Nous personnalisons l'expérience pour vous.</Text>
          </View>

          <View style={styles.grid}>
            {JOBS.map((job) => (
              <View key={job.label} style={styles.gridItem}>
                <SelectionCard
                  label={job.label}
                  icon={job.icon}
                  selected={selectedJob === job.label}
                  variant="vertical"
                  onPress={() => {
                    setSelectedJob(job.label);
                    if (job.label !== 'Autre') {
                      setCustomJob('');
                    }
                  }}
                />
              </View>
            ))}
          </View>

          {isCustomSelected && (
            <View style={styles.customInputSection}>
              <View style={styles.divider} />
              <Text style={styles.customInputLabel}>Saisissez votre secteur d'activité :</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.textInput, customJob.trim() ? styles.textInputActive : null]}
                  placeholder="Ex: Boulanger, Plombier..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={customJob}
                  onChangeText={setCustomJob}
                  autoFocus
                />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <NeonButton
            title="Continuer"
            onPress={handleNext}
            size="lg"
            variant="premium"
            loading={isSubmitting}
            disabled={!selectedJob || (isCustomSelected && !customJob.trim()) || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 8,
  },
  customInputSection: {
    marginTop: 32,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  customInputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    height: 56,
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 20,
    fontSize: 16,
    color: colors.text.primary,
  },
  textInputActive: {
    borderColor: colors.primary.main + '70',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
});
