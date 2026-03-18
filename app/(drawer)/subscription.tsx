import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated as RNAnimated,
  Easing,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import {
  ArrowLeft,
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
  Calendar,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useUserCredits } from '../../hooks/useUserCredits';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { PlanCard, Plan } from '../../components/subscription/PlanCard';
import { ManagementCard } from '../../components/subscription/ManagementCard';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBorderCard } from '../../components/ui/NeonBorderCard';

const NEON_BLUE  = colors.neon.primary;
const NEON_LIGHT = colors.primary.light;

const planIcons: Record<string, LucideIcon> = {
  curieux: Shield,
  atelier: Sparkles,
  studio:  Zap,
  agence:  Crown,
};

const getFeatureIcon = (feature: string): LucideIcon => {
  const f = feature.toLowerCase();
  if (f.includes('image'))                                   return Image;
  if (f.includes('texte'))                                   return FileText;
  if (f.includes('vidéo'))                                   return Video;
  if (f.includes('sonore') || f.includes('audio'))           return Music;
  if (f.includes('3d') || f.includes('sketch'))              return Box;
  if (f.includes('export'))                                  return f.includes('pas') ? XCircle : Download;
  if (f.includes('accompagnement') || f.includes('hipster')) return Crown;
  return CheckCircle2;
};

/* ─── Écran principal ─── */
export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading]           = useState(false);
  const [plans, setPlans]               = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, updateAiProfile } = useAuthStore();
  const { credits, loading: creditsLoading } = useUserCredits();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType]       = useState<any>('info');
  const [modalTitle, setModalTitle]     = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: any, title: string, message: string = '') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/ai/payment/plans/me');
      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€` : p.price,
        icon:  planIcons[p.id] || Shield,
        isComingSoon: p.id === 'agence',
      }));

      const visiblePlans = (user?.subscriptionStatus === 'canceled' && user?.planType)
        ? mappedPlans.filter(p => p.id !== user.planType)
        : mappedPlans;

      setPlans(visiblePlans);

      const currentPlan    = user?.planType;
      const defaultToSelect =
        visiblePlans.find(p => p.id === currentPlan && !p.isComingSoon)?.id ||
        visiblePlans.find(p => p.id === 'atelier'   && !p.isComingSoon)?.id ||
        visiblePlans.find(p => !p.isComingSoon)?.id ||
        visiblePlans[0]?.id;

      setSelectedPlan(defaultToSelect);
    } catch {
      showModal('error', 'Erreur', "Impossible de charger les plans d'abonnement.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan || plan.isComingSoon) return;

    const isRefill = selectedPlan === user?.planType;

    if (!isRefill && user?.stripeSubscriptionId && user?.planType !== 'curieux' && user?.subscriptionStatus === 'active') {
      try {
        setLoading(true);
        const response = await api.post('/ai/payment/switch-plan', { newPlanId: plan.id });
        const data = response.data?.data ?? response.data;
        const title = data.isRefill ? 'Renouvellement réussi !' : (data.isUpgrade ? 'Upgrade effectué !' : 'Downgrade planifié');
        showModal('success', title, data.message);
        await updateAiProfile({ planType: plan.id });
        await fetchPlans();
      } catch (error: any) {
        showModal('error', 'Erreur', error?.message || error?.response?.data?.message || 'Impossible de changer de plan');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (plan.stripePriceId === null) { await handlePlanConfirmation(plan.id); return; }
    await initializePaymentSheet(plan.stripePriceId);
  };

  const handlePlanConfirmation = async (planId: string) => {
    try {
      const confirmResp = await api.post('/ai/payment/confirm-plan', { planId });
      await updateAiProfile({ planType: planId, subscriptionStatus: 'active' });
      await fetchPlans();
      const limits     = confirmResp.data?.limits;
      const limitsText = limits
        ? `\n\nVos limites:\n• ${limits.promptsLimit} textes\n• ${limits.imagesLimit} images\n• ${limits.videosLimit} vidéos\n• ${limits.audioLimit} audios`
        : '';
      showModal('success', 'Succès ! 🎉', `Abonnement activé avec succès.${limitsText}`);
      setTimeout(() => setModalVisible(false), 3000);
    } catch {
      showModal('error', 'Erreur', 'Impossible de sauvegarder votre plan.');
    }
  };

  const initializePaymentSheet = async (priceId: string) => {
    setLoading(true);
    try {
      const resp   = await api.post('/ai/payment/create-payment-sheet', { priceId, planId: selectedPlan, userId: user?.id });
      const data   = resp.data?.data ?? resp.data ?? resp;
      const secret = data.paymentIntentClientSecret || data.clientSecret || data.paymentIntent?.client_secret;
      const ephem  = data.ephemeralKey  || data.customer_ephemeral_key;
      const custId = data.customerId    || data.customer || data.customer_id;
      if (!secret) throw new Error('Client secret non récupéré.');
      await initPaymentSheet({ paymentIntentClientSecret: secret, merchantDisplayName: 'Hipster IA', customerEphemeralKeySecret: ephem, customerId: custId });
      const result: any = await presentPaymentSheet();
      if (result.error) { showModal('error', 'Paiement échoué', result.error.message); setLoading(false); return; }
      await handlePlanConfirmation(selectedPlan!);
    } catch (e: any) {
      showModal('error', 'Erreur paiement', e?.message || "Impossible d'initialiser le paiement.");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = selectedPlan
    ? (plans.find(p => p.id === selectedPlan)?.isComingSoon
        ? 'À venir'
        : (selectedPlan === user?.planType ? 'Renouveler mon forfait' : 'Confirmer mon choix'))
    : 'Sélectionnez un plan';

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── HEADER (style profile.tsx) ── */}
          <View style={s.header}>
            <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <View style={s.titleRow}>
                <Text style={s.titleSub}>Plans d'abonnement</Text>
              </View>
            </View>
          </View>

          {loading && plans.length === 0 ? (
            <View style={s.loader}>
              <ActivityIndicator color={NEON_BLUE} size="large" />
              <Text style={s.loaderText}>Chargement des plans…</Text>
            </View>
          ) : (
            <>
              {/* ── Carte de gestion abonnement actif ── */}
              {user?.planType && user.planType !== 'curieux' && (
                <ManagementCard
                  subscriptionStatus={user.subscriptionStatus}
                  subscriptionEndDate={user.subscriptionEndDate}
                  planName={plans.find(p => p.id === user.planType)?.name || 'Pack Premium'}
                />
              )}

              {/* ── Sous-titre ── */}
              <View style={s.topSection}>
                <Text style={s.subtitle}>Sélectionnez l'offre qui vous correspond</Text>
              </View>

              {/* ── Liste des plans ── */}
              <View style={s.plansContainer}>
                {plans.map(plan => (
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

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <NeonActionButton
            onPress={handleUpgrade}
            loading={loading}
            disabled={loading || !selectedPlan || !!plans.find(p => p.id === selectedPlan)?.isComingSoon}
            label={buttonLabel}
            icon={<Sparkles size={16} color="#ffffff" />}
          />
          <Text style={s.secureText}>Paiement sécurisé via Stripe</Text>
        </View>
      </SafeAreaView>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Header (profil style) */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginRight: 58,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  titleSub: {
    fontFamily: 'Arimo-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    color: '#ffffff',
    marginBottom: 2,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loaderText: {
    color: colors.text.secondary,
    marginTop: 16,
    fontFamily: 'Arimo-Regular',
  },

  /* Management card */
  managementCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.12)',
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary + '99', // 60% alpha
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    fontFamily: 'Arimo-Bold',
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  currentPlanTitle: {
    fontFamily: 'Brittany-Signature',
    fontSize: 22,
    color: '#fff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    paddingLeft: 4,
  },
  managementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  managementLabel: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: colors.text.muted,
    flex: 1,
  },
  managementValue: {
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    color: '#ffffff',
  },

  /* Top section */
  topSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  plansContainer: {
    gap: 16,
  },

  /* Neon border card */
  neonWrapper: { position: 'relative' },
  neonClip: {
    position: 'absolute',
    top: -1, left: -1, right: -1, bottom: -0.5,
    borderRadius: 21,
    overflow: 'hidden',
    zIndex: 2,
  },
  neonTrack: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask: {
    position: 'absolute',
    top: 1, left: 1, right: 1, bottom: 0.5,
    borderRadius: 20,
    zIndex: 1,
  },
  bloomMid: {
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 24, backgroundColor: 'transparent',
    shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 8,
  },
  bloomFar: {
    position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 28, backgroundColor: 'transparent',
    shadowColor: NEON_LIGHT, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 28, elevation: 4,
  },
  floorGlow: {
    position: 'absolute', bottom: -16, alignSelf: 'center',
    width: '80%', height: 24, borderRadius: 50, backgroundColor: 'transparent',
    shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },

  /* Plan card */
  planWrapper:   { flex: 1, position: 'relative', marginBottom: 12 },
  touchableArea: { flex: 1 },
  planCard: {
    backgroundColor: colors.background.secondary + 'eb', // 92% alpha
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 3,
  },
  planCardSelected: {
    backgroundColor: '#030814',
    borderWidth: 0,
  },
  badge: {
    position: 'absolute', top: 0, right: 0, zIndex: 20,
    paddingHorizontal: 15, paddingVertical: 6,
    borderBottomLeftRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderTopRightRadius: 20,
  },
  badgeText: {
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.4)',
  },
  planName: {
    fontFamily: 'Arimo-Bold',
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  planNameSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  planPrice: {
    fontFamily: 'Arimo-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  planPriceSelected: {
    color: '#ffffff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pricePeriod: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: '#ffffff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  planDesc: {
    fontFamily: 'Arimo-Regular',
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
    fontFamily: 'Arimo-Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },
  featureTextSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  agencyRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  agencyText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },

  /* Bouton */
  btnWrapper: {
    alignSelf: 'center',
    width: '70%',
  },
  btnPressable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  btnGradient: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#fff',
  },

  /* Footer */
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  secureText: {
    fontFamily: 'Arimo-Regular',
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },
});