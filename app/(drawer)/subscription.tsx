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
  ChevronLeft,
  Check,
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
import { UsageBar } from '../../components/UsageBar';
import { GenericModal } from '../../components/ui/GenericModal';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://hipster-api.fr';

interface Plan {
  id: string;
  name: string;
  price: number | string;
  description: string;
  features: string[];
  stripePriceId: string | null;
  icon?: LucideIcon;
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

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, updateAiProfile } = useAuthStore();

  // Modal State
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
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/ai/subscriptions/plans');
      const backendPlans = resp.data?.data ?? resp.data ?? [];

      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€` : p.price,
        icon: planIcons[p.id] || Shield,
      }));

      setPlans(mappedPlans);

      // Default selection (Atelier if available, else first)
      const currentPlan = user?.aiProfile?.planType;
      const defaultToSelect = mappedPlans.find(p => p.id === currentPlan)?.id ||
        mappedPlans.find(p => p.id === 'atelier')?.id ||
        mappedPlans[0]?.id;

      setSelectedPlan(defaultToSelect);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showModal('error', 'Erreur', 'Impossible de charger les plans d\'abonnement.');
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentSheet = async (priceId: string) => {
    setLoading(true);
    try {
      // Request backend to create PaymentSheet params for the selected priceId
      // Include userId so webhook can find user after payment
      const resp = await api.post(`/ai/payment/create-payment-sheet`, {
        priceId,
        userId: user?.id, // ← Pass userId for webhook lookup
      });

      // backend may return data in different shapes; try common fields
      const data = resp.data?.data ?? resp.data ?? resp;
      const paymentIntentClientSecret = data.paymentIntentClientSecret || data.clientSecret || data.paymentIntent?.client_secret;
      const customerEphemeralKey = data.ephemeralKey || data.customer_ephemeral_key;
      const customerId = data.customerId || data.customer || data.customer_id;

      if (!paymentIntentClientSecret) {
        throw new Error('Impossible de récupérer le client secret du PaymentIntent depuis le backend.');
      }

      const initResult: any = await initPaymentSheet({
        paymentIntentClientSecret,
        merchantDisplayName: 'Hipster IA',
        customerEphemeralKeySecret: customerEphemeralKey,
        customerId,
        // applePay and googlePay config can be added here if enabled on backend
      });

      if (initResult.error) {
        throw initResult.error;
      }

      const presentResult: any = await presentPaymentSheet();
      if (presentResult.error) {
        showModal('error', 'Paiement échoué', presentResult.error.message || 'Erreur lors du paiement');
        setLoading(false);
        return;
      }

      // Payment successful — confirm plan
      await handlePlanConfirmation(selectedPlan!);
    } catch (e: any) {
      console.error('Stripe init error:', e);
      showModal('error', 'Erreur paiement', e?.message || 'Impossible d\'initialiser le paiement.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanConfirmation = async (planId: string) => {
    try {
      // Confirm plan on backend (applies limits to AiCredit)
      const confirmResp = await api.post('/ai/payment/confirm-plan', { planId });

      console.log('[Plan Confirmation] Limits applied:', confirmResp.data?.limits);

      // Update local user store with new limits and active status
      await updateAiProfile({
        planType: planId,
        subscriptionStatus: 'active'
      });

      // Show success with limits info
      const limits = confirmResp.data?.limits;
      const limitsText = limits
        ? `\n\nVos limites:\n• ${limits.promptsLimit} textes\n• ${limits.imagesLimit} images\n• ${limits.videosLimit} vidéos\n• ${limits.audioLimit} audios`
        : '';

      showModal('success', 'Succès ! 🎉', `Abonnement activé avec succès.${limitsText}`);

      // Delay navigation slightly to let user see success message
      setTimeout(() => {
        setModalVisible(false);
        router.push('/(onboarding)/welcome');
      }, 3000);
    } catch (error) {
      console.error('Error saving plan:', error);
      showModal('error', 'Erreur', 'Impossible de sauvegarder votre plan.');
    }
  };

  const handleUpgrade = async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    // For free plan, skip Stripe and just save
    if (plan.stripePriceId === null) {
      await handlePlanConfirmation(plan.id);
      return;
    }

    // For paid plans, initialize payment sheet
    await initializePaymentSheet(plan.stripePriceId);
  };

  return (
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
            <View style={styles.topSection}>
              <Text style={styles.title}>Passez au niveau supérieur</Text>
              <Text style={styles.subtitle}>Libérez votre créativité avec nos outils premium</Text>
            </View>

            {/* Votre usage */}
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ color: colors.text.secondary, fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
                Votre usage
              </Text>
              <UsageBar />
            </View>

            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const PlanIcon = plan.icon;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planCard, selectedPlan === plan.id && styles.selectedPlanCard]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}>
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>PLUS POPULAIRE</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              selectedPlan === plan.id
                                ? colors.primary.main + '22'
                                : 'rgba(255,255,255,0.05)',
                          },
                        ]}>
                        {PlanIcon && (
                          <PlanIcon
                            size={24}
                            color={selectedPlan === plan.id ? colors.primary.main : colors.text.muted}
                          />
                        )}
                      </View>
                      <View>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planPrice}>
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
                          <View
                            key={idx}
                            style={[
                              styles.featureRow,
                              isAccompagnement && styles.agencyRow
                            ]}
                          >
                            <FeatureIcon
                              size={16}
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
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.upgradeButton, loading && styles.disabledButton]}
          onPress={handleUpgrade}
          disabled={loading || !selectedPlan}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              {selectedPlan ? 'Confirmer mon choix' : 'Sélectionnez un plan'}
            </Text>
          )}
        </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
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
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedPlanCard: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '05',
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
    color: '#000',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
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
    paddingBottom: Platform.OS === 'ios' ? 0 : 24,
    backgroundColor: colors.background.dark,
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
});
