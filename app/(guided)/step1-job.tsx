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
  { label: 'Flyers', category: 'Document', icon: FileText },
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
                  variant="vertical"
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
    marginBottom: 36,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 23,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47.5%',
    marginBottom: 4,
  },
  customInputSection: {
    marginTop: 36,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 32,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  textInputActive: {
    borderColor: colors.primary.main + '70',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  confirmButton: {
    height: 56,
    width: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breadcrumbJob: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  breadcrumbCanal: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  functionsList: {
    gap: 13,
  },
  backToJobButton: {
    marginTop: 36,
    alignItems: 'center',
    paddingVertical: 18,
  },
  backToJobText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
