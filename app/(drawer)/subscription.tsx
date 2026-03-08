import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import {
  ChevronLeft,
  Crown,
  Zap,
  Shield,
  LucideIcon,
  Sparkles,
  Image,
  FileText,
  Video,
  Music,
  Download,
  Box,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useUserCredits } from '../../hooks/useUserCredits';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';

interface Plan {
  id: string;
  name: string;
  price: number | string;
  description: string;
  features: string[];
  stripePriceId: string | null;
  icon?: LucideIcon;
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

/* ================= COMPONENTS ================= */

const PlanCard = ({
  plan,
  isSelected,
  onSelect,
  loading
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  loading: boolean;
}) => {
  const isComingSoon = plan.isComingSoon;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!loading && !isComingSoon) scale.value = withSpring(0.98, { damping: 15 });
  };
  const handlePressOut = () => {
    if (!loading && !isComingSoon) scale.value = withSpring(1, { damping: 15 });
  };

  const PlanIcon = plan.icon;

  return (
    <Animated.View style={[styles.planWrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={loading || isComingSoon}
        style={[styles.touchableArea, isComingSoon && { opacity: 0.5 }]}
      >
        {/* Glow layers */}
        {isSelected && !isComingSoon && (
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
          isSelected && !isComingSoon && styles.selectedPlanCard,
        ]}>
          {plan.popular && !isComingSoon && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>PLUS POPULAIRE</Text>
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
              isSelected && !isComingSoon && styles.iconContainerActive,
            ]}>
              {PlanIcon && (
                <PlanIcon
                  size={24}
                  color={isSelected && !isComingSoon ? '#ffffff' : colors.text.muted}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planName, isSelected && !isComingSoon && styles.selectedPlanName, isComingSoon && { color: colors.text.muted }]}>{plan.name}</Text>
              <Text style={[styles.planPrice, isSelected && !isComingSoon && styles.selectedPlanPrice, isComingSoon && { color: colors.text.muted }]}>
                {plan.price}
                {typeof plan.price === 'string' && plan.price.toLowerCase().includes('€') ? (
                  <Text style={styles.pricePeriod}>/mois</Text>
                ) : null}
              </Text>
            </View>
          </View>

          <Text style={styles.planDescription}>{plan.description}</Text>

          <View style={styles.featuresList}>
            {plan.features.map((feature, idx) => {
              const FeatureIcon = getFeatureIcon(feature);
              const isAccompagnement = feature.toLowerCase().includes('accompagnement');
              return (
                <View key={idx} style={[styles.featureRow, isAccompagnement && styles.agencyRow]}>
                  <FeatureIcon size={16} color={isAccompagnement ? colors.text.primary : colors.text.muted} />
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

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, updateAiProfile } = useAuthStore();
  const { credits, loading: creditsLoading } = useUserCredits();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: any, title: string, message: string = '', onConfirm?: () => void) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    if (onConfirm) {
      // Logic for confirmation can be added to GenericModal if it supports it, 
      // otherwise we can use a simpler approach for now.
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/ai/payment/plans/me');
      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€` : p.price,
        icon: planIcons[p.id] || Shield,
        isComingSoon: p.id === 'studio' || p.id === 'agence',
      }));

      const visiblePlans = (user?.subscriptionStatus === 'canceled' && user?.planType)
        ? mappedPlans.filter(p => p.id !== user.planType)
        : mappedPlans;

      setPlans(visiblePlans);

      const currentPlan = user?.planType;
      const defaultToSelect = visiblePlans.find(p => p.id === currentPlan && !p.isComingSoon)?.id ||
        visiblePlans.find(p => p.id === 'atelier' && !p.isComingSoon)?.id ||
        visiblePlans.find(p => !p.isComingSoon)?.id ||
        visiblePlans[0]?.id;

      setSelectedPlan(defaultToSelect);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showModal('error', 'Erreur', 'Impossible de charger les plans d\'abonnement.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan || plan.isComingSoon) return;

    if (user?.stripeSubscriptionId && user?.planType !== 'curieux' && user?.subscriptionStatus === 'active') {
      try {
        setLoading(true);
        const response = await api.post('/ai/payment/switch-plan', { newPlanId: plan.id });
        const data = response.data;
        console.log('[handleUpgrade] switch-plan response data:', JSON.stringify(data, null, 2));

        // Si le serveur nous renvoie de quoi ouvrir Stripe (pour un refill/renouvellement)
        if (data.paymentIntentClientSecret) {
          console.log('[handleUpgrade] Initializing Payment Sheet...');
          const { error: initError } = await initPaymentSheet({
            merchantDisplayName: 'Hypster AI',
            customerId: data.customerId,
            customerEphemeralKeySecret: data.ephemeralKey,
            paymentIntentClientSecret: data.paymentIntentClientSecret,
            allowsDelayedPaymentMethods: false,
            defaultBillingDetails: { email: user.email },
          });

          if (initError) {
            console.error('[handleUpgrade] initPaymentSheet error:', initError);
            throw new Error(initError.message);
          }

          console.log('[handleUpgrade] Presenting Payment Sheet...');
          const { error: presentError } = await presentPaymentSheet();
          if (presentError) {
            console.error('[handleUpgrade] presentPaymentSheet error:', presentError);
            if (presentError.code === 'Canceled') return; // User closed the sheet
            throw new Error(presentError.message);
          }
          console.log('[handleUpgrade] Payment Sheet completed successfully');
        } else {
          console.log('[handleUpgrade] No paymentIntentClientSecret found in response');
        }

        const modalTitle = data.isRefill ? 'Renouvellement réussi !' : (data.isUpgrade ? 'Upgrade effectué !' : 'Downgrade planifié');
        showModal('success', modalTitle, data.message);
        await updateAiProfile({ planType: plan.id });
        await fetchPlans();
      } catch (error: any) {
        showModal('error', 'Erreur', error?.message || error?.response?.data?.message || 'Impossible de changer de plan');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (plan.stripePriceId === null) {
      await handlePlanConfirmation(plan.id);
      return;
    }

    await initializePaymentSheet(plan.stripePriceId);
  };

  const handlePlanConfirmation = async (planId: string) => {
    try {
      const confirmResp = await api.post('/ai/payment/confirm-plan', { planId });
      await updateAiProfile({ planType: planId, subscriptionStatus: 'active' });
      await fetchPlans();
      const limits = confirmResp.data?.limits;
      const limitsText = limits ? `\n\nVos limites:\n• ${limits.promptsLimit} textes\n• ${limits.imagesLimit} images\n• ${limits.videosLimit} vidéos\n• ${limits.audioLimit} audios` : '';
      showModal('success', 'Succès ! 🎉', `Abonnement activé avec succès.${limitsText}`);
      setTimeout(() => { setModalVisible(false); }, 3000);
    } catch (error) {
      showModal('error', 'Erreur', 'Impossible de sauvegarder votre plan.');
    }
  };

  const initializePaymentSheet = async (priceId: string) => {
    setLoading(true);
    try {
      const resp = await api.post(`/ai/payment/create-payment-sheet`, { priceId, planId: selectedPlan, userId: user?.id });
      const data = resp.data?.data ?? resp.data ?? resp;
      const paymentIntentClientSecret = data.paymentIntentClientSecret || data.clientSecret || data.paymentIntent?.client_secret;
      const customerEphemeralKey = data.ephemeralKey || data.customer_ephemeral_key;
      const customerId = data.customerId || data.customer || data.customer_id;
      if (!paymentIntentClientSecret) throw new Error('Client secret non récupéré.');
      await initPaymentSheet({ paymentIntentClientSecret, merchantDisplayName: 'Hipster IA', customerEphemeralKeySecret: customerEphemeralKey, customerId });
      const presentResult: any = await presentPaymentSheet();
      if (presentResult.error) { showModal('error', 'Paiement échoué', presentResult.error.message); setLoading(false); return; }
      await handlePlanConfirmation(selectedPlan!);
    } catch (e: any) { showModal('error', 'Erreur paiement', e?.message || 'Impossible d\'initialiser le paiement.'); } finally { setLoading(false); }
  };


  return (
    <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={2}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plans d'abonnement</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading && plans.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <ActivityIndicator color={colors.primary.main} size="large" />
              <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Chargement des plans...</Text>
            </View>
          ) : (
            <>
              {/* Management Section */}
              {user?.planType && user.planType !== 'curieux' && (
                <View style={styles.managementCard}>
                  <View style={styles.managementHeader}>
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing' || user.subscriptionStatus === 'trial') ? '#10b981' : '#f59e0b' }]} />
                      <Text style={styles.statusText}>
                        {(user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing' || user.subscriptionStatus === 'trial') ? 'Plan Actif' : (user.subscriptionStatus === 'canceled' ? 'Annulé (actif jusqu\'à fin cycle)' : 'En attente')}
                      </Text>
                    </View>
                    <Text style={styles.currentPlanTitle}>
                      {plans.find(p => p.id === user.planType)?.name || 'Pack Premium'}
                    </Text>
                  </View>

                  <View style={styles.managementInfo}>
                    <View style={styles.managementRow}>
                      <Calendar size={16} color={colors.text.muted} />
                      <Text style={styles.managementLabel}>
                        {user.subscriptionStatus === 'canceled' ? 'Expire le' : 'Prochain renouvellement'}
                      </Text>
                      <Text style={styles.managementValue}>
                        {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Non défini'}
                      </Text>
                    </View>
                  </View>

                </View>
              )}

              <View style={styles.topSection}>
                <Text style={styles.title}>Passez au niveau supérieur</Text>
                <Text style={styles.subtitle}>Libérez votre créativité avec nos outils premium</Text>
              </View>


              <View style={styles.plansContainer}>
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    onSelect={() => setSelectedPlan(plan.id)}
                    loading={loading}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <NeonButton
            title={
              selectedPlan
                ? (plans.find((p) => p.id === selectedPlan)?.isComingSoon
                  ? 'À venir'
                  : (selectedPlan === user?.planType ? 'Renouveler mon forfait' : 'Confirmer mon choix'))
                : 'Sélectionnez un plan'
            }
            onPress={handleUpgrade}
            variant="premium"
            size="lg"
            loading={loading}
            disabled={loading || !selectedPlan || plans.find(p => p.id === selectedPlan)?.isComingSoon}
          />
          <Text style={styles.secureText}>Paiement sécurisé via Stripe</Text>
        </View>

        <GenericModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    gap: 16,
  },
  planWrapper: {
    marginBottom: 8,
  },
  touchableArea: {
    position: 'relative',
  },
  planCard: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: '#1e9bff',
    backgroundColor: '#030814',
  },
  bloomFar: {
    position: 'absolute',
    top: -8, left: -8, right: -8, bottom: -8,
    backgroundColor: 'transparent',
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 4,
  },
  bloomMid: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    backgroundColor: 'transparent',
    shadowColor: '#0f60e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
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
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#1e9bff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.4)',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  selectedPlanName: {
    color: '#ffffff',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  selectedPlanPrice: {
    color: '#1e9bff',
  },
  pricePeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.muted,
  },
  planDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  agencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  agencyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  upgradeButton: {
    backgroundColor: colors.primary.main,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  secureText: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },

  /* ----- MANAGEMENT ----- */
  managementCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  currentPlanTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  managementInfo: {
    gap: 12,
    marginBottom: 20,
  },
  managementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  managementLabel: {
    fontSize: 14,
    color: colors.text.muted,
    flex: 1,
  },
  managementValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
