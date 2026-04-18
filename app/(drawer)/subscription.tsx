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
import Animated, { useSharedValue } from 'react-native-reanimated';
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
  Bell,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useUserCredits } from '../../hooks/useUserCredits';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PlanCard, Plan } from '../../components/subscription/PlanCard';
import { ManagementCard } from '../../components/subscription/ManagementCard';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

const NEON_BLUE = colors.neon.primary;

const planIcons: Record<string, LucideIcon> = {
  curieux: Shield,
  atelier: Sparkles,
  studio: Zap,
  agence: Crown,
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const user = useAuthStore(s => s.user);
  const isHydrated = useAuthStore(s => s.isHydrated);
  const { updateAiProfile, aiRefreshUser } = useAuthStore();
  const { credits, loading: creditsLoading } = useUserCredits();
  const scrollY = useSharedValue(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: any, title: string, message: string = '') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    if (!isHydrated) return;
    fetchPlans();
  }, [isHydrated]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const authUser = useAuthStore.getState().user;
      const resp = await api.get('/ai/payment/plans/me');
      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? (Number.isInteger(p.price) ? `${p.price}€` : `${p.price.toFixed(2).replace('.', ',')}€`) : p.price,
        icon: planIcons[p.id] || Shield,
        isComingSoon: p.id === 'agence',
      }));

      let visiblePlans = mappedPlans;

      if (authUser?.planType && authUser.planType !== 'curieux') {
        visiblePlans = visiblePlans.filter(p => p.id !== 'curieux');
      }

      setPlans(visiblePlans);

      const currentPlan = authUser?.planType;
      const defaultToSelect =
        visiblePlans.find(p => p.id === currentPlan && !p.isComingSoon)?.id ||
        visiblePlans.find(p => p.id === 'atelier' && !p.isComingSoon)?.id ||
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

    // Toujours passer par la Payment Sheet Stripe (create-payment-sheet côté API),
    // y compris changement de forfait pour un abonné déjà actif — même flux pour tous les packs.
    await initializePaymentSheet(plan);
  };

  const initializePaymentSheet = async (plan: Plan) => {
    const isCurieux = plan.id === 'curieux';
    if (!isCurieux && !plan.stripePriceId) {
      showModal('error', 'Erreur', 'Ce plan ne peut pas être souscrit pour le moment.');
      return;
    }

    setLoading(true);
    try {
      const priceId = !isCurieux ? plan.stripePriceId : undefined;
      const resp = await api.post('/ai/payment/create-payment-sheet', {
        priceId,
        planId: plan.id,
        userId: user?.id,
      });
      const data = resp.data?.data ?? resp.data ?? resp;
      const paymentIntentClientSecret =
        data.paymentIntentClientSecret ||
        (!data.setupIntentClientSecret ? (data.clientSecret || data.paymentIntent?.client_secret) : undefined);
      const setupIntentClientSecret = data.setupIntentClientSecret;
      const ephem = data.ephemeralKey || data.customer_ephemeral_key;
      const custId = data.customerId || data.customer || data.customer_id;
      const subscriptionId = data.subscriptionId;

      if (!paymentIntentClientSecret && !setupIntentClientSecret) {
        throw new Error('Client secret non récupéré.');
      }

      const initResult = await initPaymentSheet({
        paymentIntentClientSecret,
        setupIntentClientSecret,
        merchantDisplayName: 'Hipster IA',
        customerEphemeralKeySecret: ephem,
        customerId: custId,
        allowsDelayedPaymentMethods: true,
        returnURL: 'hipsteria://stripe-redirect',
      });
      if (initResult.error) throw new Error(initResult.error.message);

      const result: any = await presentPaymentSheet();
      if (result.error) {
        const errorMsg = result.error.message?.includes('payment flow has been cancelled')
          ? 'Le paiement a été annulé.'
          : result.error.message;
        showModal('error', 'Paiement échoué', errorMsg);
        return;
      }

      const confirmResp = await api.post('/ai/payment/confirm-plan', {
        planId: plan.id,
        paymentIntentId: data.paymentIntent?.id,
        subscriptionId,
      });

      await updateAiProfile({
        planType: plan.id,
        subscriptionStatus: (plan.id === 'curieux' ? 'trial' : 'active') as any,
        stripeCustomerId: custId,
        stripeSubscriptionId: subscriptionId,
      });
      await aiRefreshUser();
      await fetchPlans();

      const planToUpgrade = plans.find(p => p.id === selectedPlan);

      if (planToUpgrade) {
        showModal('success', 'Bravo ! 🎉', `Désormais vous avez accès au pack ${planToUpgrade.name}`);
      }

      setTimeout(() => {
        setModalVisible(false);
        router.push('/(drawer)/');
      }, 3000);
    } catch (e: any) {
      showModal('error', 'Erreur paiement', e?.message || "Impossible d'initialiser le paiement.");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = user?.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date();
  const isCanceledOrExpired = user?.subscriptionStatus === 'canceled' || user?.subscriptionStatus === 'expired' || isExpired;

  let buttonLabel = 'Sélectionnez un plan';
  let isButtonDisabled = true;

  if (selectedPlan) {
    const planObj = plans.find(p => p.id === selectedPlan);
    if (planObj?.isComingSoon) {
      buttonLabel = 'À venir';
    } else if (selectedPlan === user?.planType) {
      if (isCanceledOrExpired) {
        buttonLabel = 'Renouveler mon forfait';
        isButtonDisabled = false;
      } else {
        buttonLabel = 'Votre forfait actuel';
        isButtonDisabled = true;
      }
    } else {
      buttonLabel = 'Confirmer mon choix';
      isButtonDisabled = false;
    }
  }

  isButtonDisabled = isButtonDisabled || loading;

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <ScreenHeader
        titleSub="VOS"
        titleScript="Abonnements"
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/(drawer)');
          }
        }}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        contentContainerStyle={[s.scrollContent, { paddingTop: 140 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >

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
      </Animated.ScrollView>

      {/* ── FOOTER ── */}
      <View style={s.footer}>
        <NeonActionButton
          onPress={handleUpgrade}
          loading={loading}
          disabled={isButtonDisabled}
          label={buttonLabel}
          icon={<Bell size={16} color="#ffffff" />}
        />
        <Text style={s.secureText}>Paiement sécurisé via Stripe</Text>
      </View>

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
    color: '#ffffff73',
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