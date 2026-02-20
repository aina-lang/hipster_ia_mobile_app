import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, JobType, CreationCategory } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import {
  Scissors,
  UtensilsCrossed,
  Store,
  Palette,
  Hammer,
  MapPin,
  ChevronRight,
  Instagram,
  FileText,
  MousePointer2,
  Ticket,
  Mail,
  Video,
  Youtube,
  Plus,
  ArrowRight,
  Briefcase,
  Leaf,
  Globe,
  Smartphone,
  Music,
  Box,
} from 'lucide-react-native';

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

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
}

const UNIVERSAL_FUNCTIONS: JobFunction[] = [
  { label: 'Visuel publicitaire', category: 'Image', icon: Palette },
  { label: 'Contenu réseaux', category: 'Social', icon: Smartphone },
  { label: 'Flyers', category: 'Image', icon: FileText },
  { label: 'Aperçu avant impression', category: 'Image', icon: Ticket },
  { label: 'Page web / SEO', category: 'Texte', icon: Globe },
  { label: 'Email marketing', category: 'Texte', icon: Mail },
  // { label: 'Vidéo publicitaire', category: 'Video', icon: Video },
  // { label: 'Voix-off / Son', category: 'Audio', icon: Music },
];

export default function Step1JobScreen() {
  const router = useRouter();
  const { setJob, selectedJob } = useCreationStore();
  const [customJob, setCustomJob] = useState('');

  const isCustomSelected = selectedJob === 'Autre';

  const handleSelectJob = (job: JobType) => {
    setJob(job);
    if (job !== 'Autre') {
      setTimeout(() => {
        router.push('/(guided)/step2-type');
      }, 300);
    }
  };

  const handleConfirmCustomJob = () => {
    if (customJob.trim()) {
      setJob(customJob.trim());
      setTimeout(() => {
        router.push('/(guided)/step2-type');
      }, 300);
    }
  };

  return (
    <GuidedScreenWrapper
      onBack={
        isCustomSelected
          ? () => {
            // @ts-ignore
            setJob(null);
          }
          : undefined
      }>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Quel est votre métier ?</Text>
            <Text style={styles.subtitle}>Nous personnalisons l'expérience pour vous.</Text>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {JOBS.map((job) => (
              <View key={job.label} style={styles.gridItem}>
                <SelectionCard
                  label={job.label}
                  icon={job.icon}
                  selected={selectedJob === job.label}
                  onPress={() => {
                    if (job.label !== 'Autre') {
                      setCustomJob('');
                    }
                    handleSelectJob(job.label);
                  }}
                />
              </View>
            ))}
          </View>

          {/* Custom Input (Only appears when 'Autre' is selected) */}
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
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    customJob.trim() ? styles.confirmButtonActive : null,
                  ]}
                  onPress={handleConfirmCustomJob}
                  disabled={!customJob.trim()}>
                  <ArrowRight size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  customInputSection: {
    marginTop: 32,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    height: 56,
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    fontSize: 18,
    color: colors.text.primary,
  },
  textInputActive: {
    borderColor: '#94a3b8',
  },
  confirmButton: {
    height: 56,
    width: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonActive: {
    backgroundColor: '#94a3b8',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbJob: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  breadcrumbCanal: {
    fontSize: 14,
    color: '#9ca3af', // gray-400
  },
  functionsList: {
    gap: 12,
  },
  backToJobButton: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 16,
  },
  backToJobText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
