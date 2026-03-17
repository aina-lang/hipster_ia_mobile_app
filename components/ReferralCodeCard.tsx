import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Animated as RNAnimated, Easing, Pressable,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Crown, Zap, Shield, LucideIcon, Sparkles,
  Image, FileText, Video, Music, Download, Box, CheckCircle2, XCircle, Calendar,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';

import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';

const NEON_BLUE  = '#00d4ff';
const NEON_LIGHT = '#1e9bff';
const CARD_W     = 340;

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
  curieux: Shield, atelier: Sparkles, studio: Zap, agence: Crown,
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

function NeonBorderCard({ children, isSelected, cardBg = '#030814' }: {
  children: React.ReactNode; isSelected: boolean; cardBg?: string;
}) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loopRef    = useRef<RNAnimated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();
    if (isSelected) {
      translateX.setValue(0);
      loopRef.current = RNAnimated.loop(
        RNAnimated.timing(translateX, { toValue: -CARD_W, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
        { resetBeforeIteration: true }
      );
      loopRef.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => { loopRef.current?.stop(); };
  }, [isSelected]);

  return (
    <View style={s.neonWrapper}>
      {isSelected && (
        <View style={s.neonClip} pointerEvents="none">
          <RNAnimated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['transparent', NEON_BLUE, NEON_LIGHT, 'transparent', 'transparent', NEON_BLUE, NEON_LIGHT, 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ width: CARD_W * 2, height: '100%' }}
            />
          </RNAnimated.View>
          <View style={[s.neonMask, { backgroundColor: cardBg }]} />
        </View>
      )}
      {isSelected && (
        <>
          <View style={s.bloomFar} pointerEvents="none" />
          <View style={s.bloomMid} pointerEvents="none" />
          <View style={s.floorGlow} pointerEvents="none" />
        </>
      )}
      {children}
    </View>
  );
}

function NeonActionButton({ onPress, loading, disabled, label, icon }: {
  onPress: () => void; loading: boolean; disabled: boolean; label: string; icon?: React.ReactNode;
}) {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const spring = (v: number, speed: number) =>
    RNAnimated.spring(scale, { toValue: v, useNativeDriver: true, speed }).start();

  return (
    <RNAnimated.View style={[s.btnWrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => spring(0.96, 40)} onPressOut={() => spring(1, 20)} disabled={disabled} style={s.btnPressable}>
        <LinearGradient colors={['#264F8C', '#0a1628', '#040612']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.46, 1]} style={s.btnGradient}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {icon}
              <Text style={s.btnText}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

const PlanCard = ({ plan, isSelected, onSelect, loading }: {
  plan: Plan; isSelected: boolean; onSelect: () => void; loading: boolean;
}) => {
  const isComingSoon  = plan.isComingSoon;
  const scale         = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const PlanIcon      = plan.icon;

  return (
    <Animated.View style={[s.planWrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={() => { if (!loading && !isComingSoon) scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { if (!loading && !isComingSoon) scale.value = withSpring(1, { damping: 15 }); }}
        activeOpacity={0.9}
        disabled={loading || isComingSoon}
        style={[s.touchableArea, isComingSoon && { opacity: 0.5 }]}
      >
        <NeonBorderCard isSelected={isSelected}>
          <View style={[s.planCard, isSelected && !isComingSoon && s.planCardSelected]}>
            {plan.popular && !isComingSoon && (
              <LinearGradient colors={['#264F8C', '#0a1628', '#040612']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.46, 1]} style={s.badge}>
                <Text style={s.badgeText}>CONSEILLÉ</Text>
              </LinearGradient>
            )}
            {isComingSoon && (
              <View style={[s.badge, { backgroundColor: '#334155' }]}>
                <Text style={s.badgeText}>À VENIR</Text>
              </View>
            )}

            <View style={s.planHeader}>
              <View style={[s.iconBox, isSelected && !isComingSoon && s.iconBoxActive]}>
                {PlanIcon && <PlanIcon size={24} color={isSelected && !isComingSoon ? '#ffffff' : colors.text.muted} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.planName, isSelected && !isComingSoon && s.planNameSelected, isComingSoon && { color: colors.text.muted }]}>
                  {plan.name}
                </Text>
                <Text style={[s.planPrice, isSelected && !isComingSoon && s.planPriceSelected, isComingSoon && { color: colors.text.muted }]}>
                  {plan.price}
                  {typeof plan.price === 'string' && plan.price.toLowerCase().includes('€') ? (
                    <Text style={s.pricePeriod}>/mois</Text>
                  ) : null}
                </Text>
                {plan.description && <Text style={s.planDesc}>{plan.description}</Text>}
              </View>
            </View>

            <View style={s.featuresList}>
              {plan.features.map((feature, idx) => {
                const FeatureIcon      = getFeatureIcon(feature);
                const isAccompagnement = feature.toLowerCase().includes('accompagnement');
                return (
                  <View key={idx} style={[s.featureRow, isAccompagnement && s.agencyRow]}>
                    <FeatureIcon size={14} color={isSelected && !isComingSoon ? NEON_BLUE : (isAccompagnement ? colors.text.primary : colors.text.muted)} />
                    <Text style={[s.featureText, isAccompagnement && s.agencyText, isSelected && !isComingSoon && s.featureTextSelected]}>
                      {feature}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </NeonBorderCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, updateAiProfile } = useAuthStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading]           = useState(false);
  const [plans, setPlans]               = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType]       = useState<any>('info');
  const [modalTitle, setModalTitle]     = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: any, title: string, message = '') => {
    setModalType(type); setModalTitle(title); setModalMessage(message); setModalVisible(true);
  };

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const resp         = await api.get('/ai/payment/plans/me');
      const backendPlans = resp.data?.data ?? resp.data ?? [];
      const mappedPlans: Plan[] = backendPlans.map((p: any) => ({
        ...p,
        price: typeof p.price === 'number' ? `${p.price.toFixed(2)}€` : p.price,
        icon: planIcons[p.id] || Shield,
        isComingSoon: p.id === 'agence',
      }));
      const visiblePlans = (user?.subscriptionStatus === 'canceled' && user?.planType)
        ? mappedPlans.filter(p => p.id !== user.planType)
        : mappedPlans;
      setPlans(visiblePlans);
      setSelectedPlan(
        visiblePlans.find(p => p.id === user?.planType && !p.isComingSoon)?.id ||
        visiblePlans.find(p => p.id === 'atelier'      && !p.isComingSoon)?.id ||
        visiblePlans.find(p => !p.isComingSoon)?.id ||
        visiblePlans[0]?.id
      );
    } catch {
      showModal('error', 'Erreur', "Impossible de charger les plans d'abonnement.");
    } finally {
      setLoading(false);
    }
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
      if (!secret) throw new Error('Client secret non récupéré.');
      await initPaymentSheet({
        paymentIntentClientSecret: secret,
        merchantDisplayName: 'Hipster IA',
        customerEphemeralKeySecret: data.ephemeralKey || data.customer_ephemeral_key,
        customerId: data.customerId || data.customer || data.customer_id,
      });
      const result: any = await presentPaymentSheet();
      if (result.error) { showModal('error', 'Paiement échoué', result.error.message); return; }
      await handlePlanConfirmation(selectedPlan!);
    } catch (e: any) {
      showModal('error', 'Erreur paiement', e?.message || "Impossible d'initialiser le paiement.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan || plan.isComingSoon) return;

    if (selectedPlan !== user?.planType && user?.stripeSubscriptionId && user?.planType !== 'curieux' && user?.subscriptionStatus === 'active') {
      try {
        setLoading(true);
        const response = await api.post('/ai/payment/switch-plan', { newPlanId: plan.id });
        const data     = response.data?.data ?? response.data;
        showModal('success', data.isRefill ? 'Renouvellement réussi !' : (data.isUpgrade ? 'Upgrade effectué !' : 'Downgrade planifié'), data.message);
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

  const isActiveStatus = (s?: string) => ['active', 'trialing', 'trial'].includes(s || '');

  const buttonLabel = selectedPlan
    ? (plans.find(p => p.id === selectedPlan)?.isComingSoon ? 'À venir'
      : selectedPlan === user?.planType ? 'Renouveler mon forfait' : 'Confirmer mon choix')
    : 'Sélectionnez un plan';

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.titleSub}>Plans d'abonnement</Text>
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
                <View style={s.managementCard}>
                  <LinearGradient colors={['rgba(0,212,255,0.06)', 'transparent']} style={StyleSheet.absoluteFill} />
                  <View style={s.managementHeader}>
                    <View style={s.statusBadge}>
                      <View style={[s.statusDot, { backgroundColor: isActiveStatus(user.subscriptionStatus) ? '#10b981' : '#f59e0b' }]} />
                      <Text style={s.statusText}>
                        {isActiveStatus(user.subscriptionStatus) ? 'Plan Actif'
                          : user.subscriptionStatus === 'canceled' ? "Annulé (actif jusqu'à fin cycle)"
                          : 'En attente'}
                      </Text>
                    </View>
                    <Text style={s.currentPlanTitle}>
                      {plans.find(p => p.id === user.planType)?.name || 'Pack Premium'}
                    </Text>
                  </View>
                  <View style={s.managementRow}>
                    <Calendar size={16} color={colors.text.muted} />
                    <Text style={s.managementLabel}>
                      {user.subscriptionStatus === 'canceled' ? 'Expire le' : 'Prochain renouvellement'}
                    </Text>
                    <Text style={s.managementValue}>
                      {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Non défini'}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={s.subtitle}>Sélectionnez l'offre qui vous correspond</Text>

              <View style={s.plansContainer}>
                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} isSelected={selectedPlan === plan.id} onSelect={() => setSelectedPlan(plan.id)} loading={loading} />
                ))}
              </View>
            </>
          )}
        </ScrollView>

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

      <GenericModal visible={modalVisible} type={modalType} title={modalTitle} message={modalMessage} onClose={() => setModalVisible(false)} />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  header:        { flexDirection: 'row', alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  backButton:    { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerCenter:  { flex: 1, alignItems: 'center', marginRight: 58, paddingVertical: 10 },
  titleSub:      { fontFamily: 'Arimo-Bold', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: '#ffffff' },

  loader:     { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  loaderText: { fontFamily: 'Arimo-Regular', color: colors.text.secondary, marginTop: 16 },

  managementCard:    { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,212,255,0.12)', padding: 20, marginBottom: 24, overflow: 'hidden', backgroundColor: 'rgba(15,23,42,0.6)' },
  managementHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  statusDot:         { width: 6, height: 6, borderRadius: 3 },
  statusText:        { fontFamily: 'Arimo-Bold', fontSize: 11, color: colors.text.secondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  currentPlanTitle:  { fontFamily: 'Brittany-Signature', fontSize: 22, color: '#fff', textShadowColor: NEON_BLUE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8, paddingLeft: 4 },
  managementRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  managementLabel:   { fontFamily: 'Arimo-Regular', fontSize: 14, color: colors.text.muted, flex: 1 },
  managementValue:   { fontFamily: 'Arimo-Bold', fontSize: 14, color: '#ffffff' },

  subtitle:       { fontFamily: 'Arimo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.3, marginBottom: 24 },
  plansContainer: { gap: 16 },

  neonWrapper:  { position: 'relative' },
  neonClip:     { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 21, overflow: 'hidden', zIndex: 2 },
  neonTrack:    { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask:     { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 20, zIndex: 1 },
  bloomMid:     { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 24, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 8 },
  bloomFar:     { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 28, backgroundColor: 'transparent', shadowColor: NEON_LIGHT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 28, elevation: 4 },
  floorGlow:    { position: 'absolute', bottom: -16, alignSelf: 'center', width: '80%', height: 24, borderRadius: 50, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },

  planWrapper:      { flex: 1, position: 'relative', marginBottom: 12 },
  touchableArea:    { flex: 1 },
  planCard:         { backgroundColor: 'rgba(15,23,42,0.92)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 3 },
  planCardSelected: { backgroundColor: '#030814', borderWidth: 0 },
  badge:            { position: 'absolute', top: 0, right: 0, zIndex: 20, paddingHorizontal: 15, paddingVertical: 6, borderBottomLeftRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderTopRightRadius: 20 },
  badgeText:        { fontSize: 10, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  planHeader:       { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  iconBox:          { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  iconBoxActive:    { backgroundColor: 'rgba(30,155,255,0.15)', borderWidth: 1, borderColor: 'rgba(30,155,255,0.4)' },
  planName:         { fontFamily: 'Arimo-Bold', fontSize: 17, color: colors.text.secondary },
  planNameSelected: { color: '#ffffff' },
  planPrice:        { fontFamily: 'Arimo-Bold', fontSize: 20, color: colors.text.primary },
  planPriceSelected: { color: '#ffffff', textShadowColor: NEON_BLUE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  pricePeriod:      { fontFamily: 'Arimo-Regular', fontSize: 14, color: '#ffffff', textShadowColor: NEON_BLUE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  planDesc:         { fontFamily: 'Arimo-Regular', fontSize: 12, color: colors.text.muted, marginTop: 2 },
  featuresList:     { gap: 8, paddingLeft: 4 },
  featureRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText:      { fontFamily: 'Arimo-Regular', fontSize: 13, color: colors.text.secondary },
  featureTextSelected: { color: 'rgba(255,255,255,0.85)' },
  agencyRow:        { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  agencyText:       { fontFamily: 'Arimo-Bold', fontSize: 13, color: colors.text.primary },

  btnWrapper:  { alignSelf: 'center', width: '70%' },
  btnPressable: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  btnGradient:  { paddingVertical: 15, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  btnText:      { fontFamily: 'Arimo-Bold', fontSize: 14, letterSpacing: 0.6, color: '#fff' },

  footer:     { padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', gap: 12 },
  secureText: { fontFamily: 'Arimo-Regular', fontSize: 12, color: colors.text.muted, textAlign: 'center' },
});