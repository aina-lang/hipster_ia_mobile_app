import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';
import { colors } from '../../theme/colors';
import {
  Crown,
  Zap,
  Shield,
  Edit3,
  Image,
  FileText,
  Video,
  Music,
  Download,
  LucideIcon,
} from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { StepIndicator } from '../../components/ui/StepIndicator';

const { height } = Dimensions.get('window');

/* ================= TYPES ================= */

type FeatureType = 'image' | 'text' | 'video' | 'audio' | 'export';

interface Feature {
  label: string;
  type: FeatureType;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  description?: string;
  features: Feature[];
  icon: LucideIcon;
  popular?: boolean;
}

/* ================= ICON MAP ================= */

const featureIcons: Record<FeatureType, LucideIcon> = {
  image: Image,
  text: FileText,
  video: Video,
  audio: Music,
  export: Download,
};

/* ================= DATA ================= */

const PLANS: Plan[] = [
  {
    id: 'curieux',
    name: 'Curieux',
    price: '7 jours gratuits',
    // description:
    //   '2 générations texte + 2 générations image. ',
    features: [
      { label: '2 générations texte', type: 'text' },
      { label: '2 générations image', type: 'image' },
      // { label: "Pas d’export", type: 'export' },
    ],
    icon: Shield,
  },

  {
    id: 'atelier',
    name: 'Atelier',
    price: '9,90€ / mois',
    description:
      '30 premiers abonnés — ensuite 17,90€/mois.',
    features: [
      { label: 'Génération de texte', type: 'text' },
      { label: 'Génération d’image', type: 'image' },
    ],
    icon: Edit3,
  },

  {
    id: 'studio',
    name: 'Studio',
    price: '29,90€ / mois',
    description:
      'Pack orienté photo',
    features: [
      { label: 'Génération de texte', type: 'text' },
      { label: 'Génération d’image', type: 'image' },
      { label: 'Optimisation image HD / 4K', type: 'image' },
    ],
    icon: Zap,
    popular: true,
  },

  {
    id: 'agence',
    name: 'Agence',
    price: '69,99€ / mois',
    description: 'Puissance Total',
    features: [
      { label: 'Génération de texte', type: 'text' },
      { label: 'Génération d’image', type: 'image' },
      { label: 'Amélioration image HD / 4K', type: 'image' },
      { label: 'Création vidéo', type: 'video' },
      { label: 'Création sonore', type: 'audio' },
      { label: '25 générations 3D / Sketch', type: 'image' },
    ],
    icon: Crown,
  },
];


/* ================= SCREEN ================= */

export default function PacksScreen() {
  const router = useRouter();
  const { selectedPlan, setPlan } = useOnboardingStore();

  const handleContinue = () => {
    // Navigate to registration
    router.push('/(auth)/register');
  };

  return (
    <BackgroundGradientOnboarding>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre pack</Text>
          <Text style={styles.subtitle}>
            Sélectionnez l'offre qui vous correspond
          </Text>
        </View>

        {/* Plans */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.plansContainer}>
            {PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setPlan(plan.id)}
                activeOpacity={0.85}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlanCard,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>CONSEILLÉ</Text>
                  </View>
                )}

                {/* Header */}
                <View style={styles.planHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      selectedPlan === plan.id && styles.iconContainerActive,
                    ]}
                  >
                    <plan.icon
                      size={28}
                      color={
                        selectedPlan === plan.id
                          ? colors.primary.main
                          : colors.text.muted
                      }
                    />
                  </View>

                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>

                    {plan.description && (
                      <Text style={styles.planDescription}>
                        {plan.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View style={styles.featuresList}>
                  {plan.features.map((feature, idx) => {
                    const Icon = featureIcons[feature.type];
                    return (
                      <View key={idx} style={styles.featureRow}>
                        <Icon size={14} color={colors.text.muted} />
                        <Text style={styles.featureText}>{feature.label}</Text>
                      </View>
                    );
                  })}

                  {/* 🔥 ACCOMPAGNEMENT AGENCE */}
                  <View style={styles.agencyRow}>
                    <Crown size={14} color={colors.text.primary} />
                    <Text style={styles.agencyText}>
                      Accompagnement de l'agence
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <NeonButton onPress={handleContinue} title="Continuer" size="lg" variant="premium" />
        </View>
      </View>
    </BackgroundGradientOnboarding>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: "hidden"
  },
  selectedPlanCard: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.primary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.primary.main + '22',
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  planDescription: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  featuresList: {
    gap: 8,
    marginLeft: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  agencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  agencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});
