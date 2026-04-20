import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  Scissors, UtensilsCrossed, Store, Hammer,
  MapPin, Briefcase, Leaf, Plus,
} from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonBorderCard } from '../../components/ui/NeonBorderCard';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { JobType } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';

const JOBS: { label: JobType; icon: any }[] = [
  { label: 'Coiffure & Esthétique',         icon: Scissors        },
  { label: 'Restaurant / Bar',              icon: UtensilsCrossed },
  { label: 'Commerce / Boutique',           icon: Store           },
  { label: 'Artisans du bâtiment',          icon: Hammer          },
  { label: 'Service local',                 icon: MapPin          },
  { label: 'Profession libérale',           icon: Briefcase       },
  { label: 'Bien-être / Santé alternative', icon: Leaf            },
  { label: 'Autre',                         icon: Plus            },
];

function JobCard({ job, isSelected, onSelect, disabled }: {
  job: { label: JobType; icon: any };
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const Icon   = job.icon;
  const scale  = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[s.cardWrapper, aStyle]}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={() => { if (!disabled) scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { if (!disabled) scale.value = withSpring(1,    { damping: 15 }); }}
        activeOpacity={0.9}
        disabled={disabled}
        style={s.touchable}
      >
        <NeonBorderCard isSelected={isSelected}>
          <View style={[s.card, isSelected && s.cardSelected]}>
            <View style={[s.iconBox, isSelected && s.iconBoxSelected]}>
              <Icon size={24} color={isSelected ? colors.neonBlue : colors.text.muted} />
            </View>
            <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]} numberOfLines={2}>
              {job.label}
            </Text>
          </View>
        </NeonBorderCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OnboardingJobScreen() {
  const router = useRouter();
  const { user, updateAiProfile } = useAuthStore();

  const [selectedJob, setSelectedJob]   = useState<JobType | null>(user?.job as JobType || null);
  const [customJob, setCustomJob]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused]           = useState(false);

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

  const scrollY = useSharedValue(0);

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>

        <ScreenHeader 
          titleSub="Votre" 
          titleScript="métier" 
          onBack={() => router.back()} 
          scrollY={scrollY}
        />

        <Animated.ScrollView
          contentContainerStyle={[s.scrollContent, { paddingTop: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          onScroll={(e) => {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <Animated.View entering={FadeInDown.duration(800)} style={s.content}>

            <Text style={s.subtitle}>Nous personnalisons l'expérience pour vous.</Text>

            <View style={s.grid}>
              {JOBS.map((job) => (
                <JobCard
                  key={job.label}
                  job={job}
                  isSelected={selectedJob === job.label}
                  onSelect={() => {
                    setSelectedJob(job.label);
                    if (job.label !== 'Autre') setCustomJob('');
                  }}
                  disabled={isSubmitting}
                />
              ))}
            </View>

            {isCustomSelected && (
              <Animated.View entering={FadeInDown.duration(400)} style={s.customSection}>
                <View style={s.divider} />
                <Text style={s.customLabel}>Saisissez votre secteur d'activité :</Text>
                <NeonBorderInput isActive={focused}>
                  <TextInput
                    style={[s.input, focused && s.inputActive]}
                    placeholder="Ex: Boulanger, Plombier..."
                    placeholderTextColor="#6b7280"
                    value={customJob}
                    onChangeText={setCustomJob}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoFocus
                  />
                </NeonBorderInput>
              </Animated.View>
            )}

          </Animated.View>
        </Animated.ScrollView>

        <View style={s.footer}>
          <NeonActionButton
            label="Continuer"
            onPress={handleNext}
            loading={isSubmitting}
            disabled={!selectedJob || (isCustomSelected && !customJob.trim()) || isSubmitting}
          />
        </View>

      </KeyboardAvoidingView>
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  kav:           { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  content:       { gap: 20 },

  subtitle: {
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },

  cardWrapper: {
    width: '48%',
    marginBottom: 4,
  },
  touchable: { flex: 1 },
  card: {
    backgroundColor: '#0f172aeb',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 12,
    height: 120,
    justifyContent: 'center',
    zIndex: 3,
  },
  cardSelected: {
    backgroundColor: '#030814',
    borderWidth: 0,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.4)',
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },

  cardLabel: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  cardLabelSelected: {
    fontFamily: fonts.arimo.bold,
    color: 'white',
    fontWeight: '700',
  },

  customSection: { gap: 12 },
  divider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  customLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: colors.gray,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.arimo.regular,
    color: 'white',
    borderWidth: 1,
    borderColor: '#ffffff14',
    zIndex: 3,
  },
  inputActive: { borderColor: 'transparent', backgroundColor: colors.midnightBlue },

  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});