import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, CreationType } from '../../store/creationStore';
import { Share2, Globe, FileText, Tag, Calendar } from 'lucide-react-native';

const TYPES: { label: CreationType; icon: any }[] = [
  { label: 'Réseaux sociaux', icon: Share2 },
  { label: 'Site web', icon: Globe },
  { label: 'Flyers', icon: FileText },
  { label: 'Promotions', icon: Tag },
  { label: 'Événements', icon: Calendar },
];

export default function Step2TypeScreen() {
  const router = useRouter();
  const { setType, selectedType } = useCreationStore();

  const handleSelect = (type: CreationType) => {
    setType(type);
    setTimeout(() => {
      router.push('/(guided)/step3-context');
    }, 300);
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Que souhaitez-vous créer ?</Text>
            <Text style={styles.subtitle}>Choisissez le format adapté.</Text>
          </View>

          <View style={styles.animationContainer}>
            <DeerAnimation size={120} progress={40} />
          </View>

          <View style={styles.list}>
            {TYPES.map((type) => (
              <SelectionCard
                key={type.label}
                label={type.label}
                icon={type.icon}
                selected={selectedType === type.label}
                onPress={() => handleSelect(type.label)}
                fullWidth
              />
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
  list: {
    gap: 4,
  },
});
