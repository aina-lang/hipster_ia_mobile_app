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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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
  isComingSoon?: boolean;
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

/* ================= COMPONENTS ================= */

const PlanCard = ({ plan, isSelected, onSelect, submitting }: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  submitting: boolean;
}) => {
  const isComingSoon = plan.isComingSoon;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { if (!submitting) scale.value = withSpring(0.97, { damping: 15 }); };
  const handlePressOut = () => { if (!submitting) scale.value = withSpring(1, { damping: 15 }); };

  const FeatureIcon = plan.icon;

  return (
    <Animated.View style={[styles.planWrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={submitting || isComingSoon}
        style={[styles.touchableArea, isComingSoon && { opacity: 0.5 }]}
      >
        {/* Glow layers */}
        {isSelected && (
          <>
            <View style={styles.bloomFar} pointerEvents="none" />
            <View style={styles.bloomMid} pointerEvents="none" />
            <View style={styles.borderGlow} pointerEvents="none" />
            <View style={styles.floorGlow} pointerEvents="none" />
          </>
        )}

        {/* Main card container */}
        <View style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          submitting && { opacity: 0.8 }
        ]}>
          {plan.popular && !isComingSoon && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>CONSEILLÉ</Text>
            </View>
          )}

          {isComingSoon && (
            <View style={[styles.popularBadge, { backgroundColor: '#334155' }]}>
              <Text style={styles.popularBadgeText}>À VENIR</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <View style={[
              styles.iconContainer,
              isSelected && styles.iconContainerActive,
            ]}>
              <FeatureIcon
                size={28}
                color={isSelected ? '#ffffff' : (isComingSoon ? colors.text.muted : colors.text.muted)}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.planName, isSelected && styles.selectedPlanName, isComingSoon && { color: colors.text.muted }]}>{plan.name}</Text>
              <Text style={[styles.planPrice, isSelected && styles.selectedPlanPrice, isComingSoon && { color: colors.text.muted }]}>{plan.price}</Text>

              {plan.description && (
                <Text style={styles.planDescription}>
                  {plan.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.featuresList}>
            {plan.features.map((feature, idx) => {
              const Icon = getFeatureIcon(feature);
              const isAccompagnement = feature.toLowerCase().includes('accompagnement');
              return (
                <View key={idx} style={[styles.featureRow, isAccompagnement && styles.agencyRow]}>
                  <Icon size={14} color={isAccompagnement ? colors.text.primary : colors.text.muted} />
                  <Text style={[styles.featureText, isAccompagnement && styles.agencyText]}>
                    {feature}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
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
      const resp = await api.get('/ai/payment/plans');
      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€` : p.price,
        icon: planIcons[p.id] || Shield,
        isComingSoon: p.id === 'studio' || p.id === 'agence',
      }));

      setPlans(mappedPlans);
      if (mappedPlans.length > 0 && !selectedPlan) {
        setPlan(mappedPlans[1]?.id || mappedPlans[0].id);
      }
    } catch (error) {
      console.error('Error fetching plans in packs.tsx:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setSubmitting(true);
    router.push('/(auth)/register');
  };

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre pack</Text>
          <Text style={styles.subtitle}>
            Sélectionnez l'offre qui vous correspond
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <ActivityIndicator color={colors.primary.main} size="large" />
              <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Chargement des plans...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => setPlan(plan.id)}
                  submitting={submitting}
                />
              ))}
            </View>
          )}
        </ScrollView>

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
    paddingTop: 100,
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
    gap: 16,
  },
  planWrapper: {
    flex: 1,
    position: 'relative',
    marginBottom: 12,
  },
  touchableArea: {
    flex: 1,
  },
  planCard: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 120,
    // Ombre de profondeur
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: '#1e9bff',
    backgroundColor: '#030814',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#1e9bff',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderBottomLeftRadius: 15,
    zIndex: 10,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
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
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.4)',
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  selectedPlanName: {
    color: '#ffffff',
    fontWeight: '800',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  selectedPlanPrice: {
    color: '#1e9bff',
  },
  planDescription: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  featuresList: {
    gap: 8,
    paddingLeft: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  agencyRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  agencyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  // ── Neon Glow Layers ──
  borderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 14,
  },
  bloomMid: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#0f60e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  bloomFar: {
    position: 'absolute',
    top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 28,
    backgroundColor: 'transparent',
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 4,
  },
  floorGlow: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    width: '80%',
    height: 30,
    borderRadius: 50,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 16,
  },
});

