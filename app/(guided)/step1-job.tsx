import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, JobType } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { Scissors, UtensilsCrossed, Store, Palette, Hammer, MapPin } from 'lucide-react-native';

const JOBS: { label: JobType; icon: any }[] = [
  { label: 'Coiffeur', icon: Scissors },
  { label: 'Restaurant', icon: UtensilsCrossed },
  { label: 'Boutique', icon: Store },
  { label: 'Créateur', icon: Palette },
  { label: 'Artisan', icon: Hammer },
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
    <GuidedScreenWrapper>
      <View className="px-5">
        {/* Header */}
        <View className="items-center mb-5">
          <Text className="text-2xl font-bold text-white text-center mb-2">
            Quel est votre métier ?
          </Text>
          <Text className="text-base text-white/70 text-center">
            Nous personnalisons l'expérience pour vous.
          </Text>
        </View>

        {/* Animation */}
        <View className="items-center mb-8">
          <DeerAnimation size={120} progress={20} />
        </View>

        {/* Grid */}
        <View className="flex-row flex-wrap gap-3">
          {JOBS.map((job) => (
            <View key={job.label} className="w-[48%]">
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
    </GuidedScreenWrapper>
  );
}
