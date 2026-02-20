import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStore';
import { colors } from '../../theme/colors';
import {
  Shield,
  Sparkles,
  Zap,
  Crown,
  Image,
  FileText,
  Video,
  Music,
  Download,
  LucideIcon,
  Box,
  CheckCircle2,
  XCircle,
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
  price: string | number;
  description?: string;
  features: string[];
  icon: LucideIcon;
  popular?: boolean;
}

const planIcons: Record<string, LucideIcon> = {
  curieux: Shield,
  atelier: Sparkles,
  studio: Zap,
  agence: Crown,
};

const getFeatureIcon = (feature: string): LucideIcon => {
  const f = feature.toLowerCase();
  if (f.includes('image')) return Image;
  if (f.includes('texte')) return FileText;
  if (f.includes('vidéo')) return Video;
  if (f.includes('sonore') || f.includes('audio')) return Music;
  if (f.includes('3d') || f.includes('sketch')) return Box;
  if (f.includes('export')) return f.includes('pas') ? XCircle : Download;
  if (f.includes('accompagnement') || f.includes('hipster')) return Crown;
  return CheckCircle2;
};


/* ================= SCREEN ================= */

export default function PacksScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { selectedPlan, setPlan } = useOnboardingStore();

  useFocusEffect(
    React.useCallback(() => {
      setSubmitting(false);
    }, [])
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Public request for onboarding: always show all plans
      const resp = await api.get('/ai/payment/plans');

      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€` : p.price,
        icon: planIcons[p.id] || Shield,
      }));

      setPlans(mappedPlans);
      if (mappedPlans.length > 0 && !selectedPlan) {
        setPlan(mappedPlans[1]?.id || mappedPlans[0].id); // Atelier or first
      }
    } catch (error) {
      console.error('Error fetching plans in packs.tsx:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setSubmitting(true);
    // Navigate to registration
    router.push('/(auth)/register');
  };

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
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
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <ActivityIndicator color={colors.primary.main} size="large" />
              <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Chargement des plans...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => !submitting && setPlan(plan.id)}
                  activeOpacity={0.85}
                  disabled={submitting}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.selectedPlanCard,
                    submitting && { opacity: 0.8 }
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
                            ? '#f1f5f9'
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
                      const FeatureIcon = getFeatureIcon(feature);
                      const isAccompagnement = feature.toLowerCase().includes('accompagnement');
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.featureRow,
                            isAccompagnement && styles.agencyRow
                          ]}
                        >
                          <FeatureIcon
                            size={14}
                            color={isAccompagnement ? colors.text.primary : colors.text.muted}
                          />
                          <Text
                            style={[
                              styles.featureText,
                              isAccompagnement && styles.agencyText
                            ]}
                          >
                            {feature}
                          </Text>
                        </View>
                      );
                    })}

                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <NeonButton
            onPress={handleContinue}
            title="Continuer"
            size="lg"
            variant="premium"
            loading={submitting}
            disabled={submitting}
          />
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
    borderColor: '#94a3b8',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
