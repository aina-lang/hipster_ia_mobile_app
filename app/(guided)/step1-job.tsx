import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
} from 'lucide-react-native';

const JOBS: { label: JobType; icon: any }[] = [
  { label: 'Coiffeur', icon: Scissors },
  { label: 'Restaurant', icon: UtensilsCrossed },
  { label: 'Boutique', icon: Store },
  { label: 'Créateur', icon: Palette },
  { label: 'Artisan', icon: Hammer },
  { label: 'Service local', icon: MapPin },
  { label: 'Autre', icon: Plus },
];

interface JobFunction {
  label: string;
  category: CreationCategory;
  icon: any;
}

const UNIVERSAL_FUNCTIONS: JobFunction[] = [
  { label: 'Réseaux sociaux (image/texte)', category: 'Social', icon: Instagram },
  { label: 'Site internet / SEO (texte)', category: 'Texte', icon: MousePointer2 },
  { label: 'Flyers / Affiches (texte)', category: 'Texte', icon: Ticket },
  { label: 'Email / Newsletter (texte)', category: 'Texte', icon: Mail },
];

const CREATOR_FUNCTIONS: JobFunction[] = [
  { label: 'script vidéo (texte)', category: 'Texte', icon: Video },
  { label: 'miniatures (image)', category: 'Image', icon: Youtube },
];

export default function Step1JobScreen() {
  const router = useRouter();
  const { setJob, selectedJob, setFunction, selectedFunction } = useCreationStore();
  const [stage, setStage] = useState<'job' | 'function'>('job');
  const [customJob, setCustomJob] = useState('');

  const isCustomSelected = selectedJob === 'Autre';

  const handleSelectJob = (job: JobType) => {
    setJob(job);
    if (job !== 'Autre') {
      setTimeout(() => {
        setStage('function');
      }, 300);
    }
  };

  const handleConfirmCustomJob = () => {
    if (customJob.trim()) {
      setJob(customJob.trim());
      setTimeout(() => {
        setStage('function');
      }, 300);
    }
  };

  const handleSelectFunction = (fn: JobFunction) => {
    setFunction(fn.label, fn.category);
    setTimeout(() => {
      router.push('/(guided)/step2-personalize');
    }, 300);
  };

  const currentFunctions = selectedJob === 'Créateur' ? CREATOR_FUNCTIONS : UNIVERSAL_FUNCTIONS;

  return (
    <GuidedScreenWrapper
      onBack={
        stage === 'function'
          ? () => setStage('job')
          : isCustomSelected
            ? () => {
                // @ts-ignore
                setJob(null);
              }
            : undefined
      }>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          {stage === 'job' ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Quel est votre métier ?</Text>
                <Text style={styles.subtitle}>Nous personnalisons l'expérience pour vous.</Text>
              </View>

              {/* Animation */}
              <View style={styles.animationContainer}>
                <DeerAnimation size={120} progress={20} />
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
            </>
          ) : (
            <>
              {/* HEADER */}
              <View style={styles.header}>
                <Text style={styles.title}>Que souhaitez-vous faire ?</Text>
                <View style={styles.breadcrumb}>
                  <Text style={styles.breadcrumbJob}>{selectedJob}</Text>
                  <ChevronRight size={14} color={colors.text.muted} />
                  <Text style={styles.breadcrumbCanal}>Canal</Text>
                </View>
              </View>

              {/* ANIMATION */}
              <View style={styles.animationContainer}>
                <DeerAnimation size={120} progress={40} />
              </View>

              {/* LISTE */}
              <View style={styles.functionsList}>
                {currentFunctions.map((fn, index) => (
                  <SelectionCard
                    key={index}
                    label={fn.label}
                    icon={fn.icon}
                    selected={selectedFunction === fn.label}
                    onPress={() => handleSelectFunction(fn)}
                    fullWidth
                  />
                ))}
              </View>

              {/* Back Button */}
              <TouchableOpacity onPress={() => setStage('job')} style={styles.backToJobButton}>
                <Text style={styles.backToJobText}>← Retour au choix du métier</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
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
    color: 'rgba(255, 255, 255, 0.5)',
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
    color: '#FFFFFF',
  },
  textInputActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '0D',
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
    backgroundColor: colors.primary.main,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbJob: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
