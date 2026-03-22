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
import { SafeAreaView } from 'react-native-safe-area-context';
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

const NEON_BLUE = colors.neon.primary;

const planIcons: Record<string, LucideIcon> = {
  curieux: Shield,
  atelier: Sparkles,
  studio:  Zap,
  agence:  Crown,
};

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

      const currentPlan = user?.planType;
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
      await initPaymentSheet({ paymentIntentClientSecret: secret, merchantDisplayName: 'Hipster IA', customerEphemeralKeySecret: ephem, customerId: custId, locale: 'fr' });
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
          {/* ── HEADER ── */}
          <View style={s.header}>
            <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <View style={s.titleRow}>
                <Text style={s.titleLabel}>Plans d'abonnement</Text>
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
              {user?.planType && user.planType !== 'curieux' && (
                <ManagementCard
                  subscriptionStatus={user.subscriptionStatus}
                  subscriptionEndDate={user.subscriptionEndDate}
                  planName={plans.find(p => p.id === user.planType)?.name || 'Pack Premium'}
                />
              )}

              <View style={s.topSection}>
                <Text style={s.subtitle}>Sélectionnez l'offre qui vous correspond</Text>
              </View>

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

  /* Header */
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
  },
  titleLabel: {
    fontFamily: 'Arimo-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)'
  },
  titleScript: {
    fontFamily: 'Brittany-Signature',
    fontSize: 28,
    color: '#fff',
    
    
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