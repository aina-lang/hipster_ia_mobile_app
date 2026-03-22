import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, Image, Animated as RNAnimated,
  Easing, Pressable,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Image as ImageIcon, FileText, Video, Music, Download, Box, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react-native';

import { api } from '../../api/client';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';
import { colors } from '../../theme/colors';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';

interface Plan {
  id: string;
  name: string;
  price: string | number;
  description?: string;
  features: string[];
  popular?: boolean;
  isComingSoon?: boolean;
}

const PLAN_IMAGES: Record<string, any> = {
  curieux: require('../../assets/images/packs/packCurieux.png'),
  atelier: require('../../assets/images/packs/atelier.png'),
  studio:  require('../../assets/images/packs/studio.png'),
};

const COMING_SOON_IDS = new Set(['agence']);
const CARD_W = 340;

function getFeatureIcon(feature: string) {
  const f = feature.toLowerCase();
  if (f.includes('image'))                                   return ImageIcon;
  if (f.includes('texte'))                                   return FileText;
  if (f.includes('vidéo'))                                   return Video;
  if (f.includes('sonore') || f.includes('audio'))           return Music;
  if (f.includes('3d') || f.includes('sketch'))              return Box;
  if (f.includes('export'))                                  return f.includes('pas') ? XCircle : Download;
  if (f.includes('accompagnement') || f.includes('hipster')) return Crown;
  return CheckCircle2;
}

function formatPrice(price: string | number) {
  return typeof price === 'number' ? `${price.toFixed(2)}€` : price;
}

function PlanIcon({ planId, size = 56, color, isSelected }: { planId: string; size?: number; color?: string; isSelected?: boolean }) {
  const glow = isSelected ? s.planIconGlow : undefined;
  if (planId === 'agence') return <Crown size={size} color={isSelected ? '#00eaff' : color} style={glow} />;
  const source = PLAN_IMAGES[planId];
  if (!source) return null;
  return (
    <View style={glow}>
      <Image source={source} style={{ width: size, height: size, tintColor: isSelected ? '#00eaff' : color }} resizeMode="contain" />
    </View>
  );
}

function FeatureItem({ feature, isSelected }: { feature: string; isSelected?: boolean }) {
  const Icon     = getFeatureIcon(feature);
  const isAgency = feature.toLowerCase().includes('accompagnement');
  const iconColor = isSelected
    ? '#ffffff'
    : isAgency ? colors.text.primary : colors.text.muted;
  return (
    <View style={[s.featureRow, isAgency && s.agencyRow]}>
      <View style={isSelected ? s.featureIconGlow : undefined}>
        <Icon size={14} color={iconColor} />
      </View>
      <Text style={[s.featureText, isAgency && s.agencyText, isSelected && s.featureTextSelected]}>
        {feature}
      </Text>
    </View>
  );
}

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
        RNAnimated.timing(translateX, {
          toValue: -CARD_W,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
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
              colors={['transparent', '#00eaff', '#1e9bff', 'transparent', 'transparent', '#00eaff', '#1e9bff', 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: CARD_W * 2, height: '100%' }}
            />
          </RNAnimated.View>
          <View style={[s.neonMask, { backgroundColor: cardBg }]} />
        </View>
      )}
      {isSelected && (
        <>
          <View style={s.bloomFar}  pointerEvents="none" />
          <View style={s.bloomMid}  pointerEvents="none" />
          <View style={s.floorGlow} pointerEvents="none" />
        </>
      )}
      {children}
    </View>
  );
}

function ContinuerButton({ onPress, loading, disabled }: {
  onPress: () => void; loading: boolean; disabled: boolean;
}) {
  const scale    = useRef(new RNAnimated.Value(1)).current;
  const pressIn  = () => RNAnimated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => RNAnimated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <RNAnimated.View style={[s.btnWrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} disabled={disabled} style={s.btnPressable}>
        <LinearGradient
          colors={['#264F8C', '#0a1628', '#040612']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.46, 1]}
          style={s.btnGradient}
        >
          {loading
            ? <ActivityIndicator color="#ffffff" size="small" />
            : <Text style={s.btnText}>Continuer</Text>
          }
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

function PlanCard({ plan, isSelected, onSelect, submitting }: {
  plan: Plan; isSelected: boolean; onSelect: () => void; submitting: boolean;
}) {
  const scale  = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const spring = (v: number) => withSpring(v, { damping: 15 });

  return (
    <Animated.View style={[s.planWrapper, aStyle]}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={() => { if (!submitting) scale.value = spring(0.97); }}
        onPressOut={() => { if (!submitting) scale.value = spring(1); }}
        activeOpacity={0.9}
        disabled={submitting || plan.isComingSoon}
        style={[s.touchableArea, plan.isComingSoon && { opacity: 0.5 }]}
      >
        <NeonBorderCard isSelected={isSelected}>
          <View style={[s.planCard, isSelected && s.planCardSelected, submitting && { opacity: 0.8 }]}>

            {plan.popular && !plan.isComingSoon && (
              <LinearGradient
                colors={['#264F8C', '#0a1628', '#040612']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.46, 1]}
                style={s.badge}
              >
                <Text style={s.badgeText}>CONSEILLÉ</Text>
              </LinearGradient>
            )}
            {plan.isComingSoon && (
              <View style={[s.badge, { backgroundColor: '#334155' }]}>
                <Text style={s.badgeText}>À VENIR</Text>
              </View>
            )}

            <View style={s.planHeader}>
              <View style={[s.iconBox, isSelected && s.iconBoxActive]}>
                <PlanIcon planId={plan.id} size={56} color={isSelected ? '#ffffff' : colors.text.muted} isSelected={isSelected} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.planName, isSelected && s.planNameSelected, plan.isComingSoon && { color: colors.text.muted }]}>
                  {plan.name}
                </Text>
                <Text style={[s.planPrice, isSelected && s.planPriceSelected, plan.isComingSoon && { color: colors.text.muted }]}>
                  {plan.price}
                </Text>
                {plan.description && <Text style={s.planDesc}>{plan.description}</Text>}
              </View>
            </View>

            <View style={s.featuresList}>
              {plan.features.map((f, i) => <FeatureItem key={i} feature={f} isSelected={isSelected} />)}
            </View>
          </View>
        </NeonBorderCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PacksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromWelcome = params?.from === 'welcome';
  const { selectedPlan, setPlan } = useOnboardingStore();
  const { setIsReturningFromBack } = useWelcomeVideoStore();
  const [plans, setPlans]           = useState<Plan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(React.useCallback(() => { setSubmitting(false); }, []));
  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    try {
      setLoading(true);
      const resp = await api.get('/ai/payment/plans');
      const raw: any[] = resp.data?.data ?? resp.data ?? [];
      const mapped: Plan[] = raw.map(p => ({
        ...p,
        price: formatPrice(p.price),
        isComingSoon: COMING_SOON_IDS.has(p.id),
      }));
      setPlans(mapped);
      if (mapped.length > 0 && !selectedPlan) setPlan(mapped[1]?.id ?? mapped[0].id);
    } catch (e) {
      console.error('PacksScreen – fetchPlans:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BackgroundGradientOnboarding darkOverlay>
      {/* ── FIXED HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity 
          style={s.backButton}
          onPress={() => {
            setIsReturningFromBack(true);
            router.replace('/');
          }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.titleRow}>
            <Text style={s.titleSub}>Choisissez</Text>
            <Text style={s.titleScript}>votre pack</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={s.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={s.screen}
      >
        {loading ? (
          <View style={s.loader}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={s.loaderText}>Chargement des plans…</Text>
          </View>
        ) : (
          <View style={s.plansContainer}>
            {plans.map(plan => (
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

      <View style={s.footer}>
        <ContinuerButton
          onPress={() => { 
            setSubmitting(true); 
            router.push({
              pathname: '/(auth)/register',
              params: { from: fromWelcome ? 'welcome' : 'packs' }
            });
          }}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  /* Header - Fixed at top */
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 8, backgroundColor: 'rgba(10,15,30,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 100 },
  backButton:     { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerCenter:   { flex: 1, alignItems: 'center', marginRight: 58 },
  
  screen:         { flex: 1, paddingTop: 0 },
  scrollContent:  { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  loader:         { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  loaderText:     { color: colors.text.secondary, marginTop: 16, fontFamily: 'Arimo-Regular' },
  plansContainer: { gap: 16 },

  titleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  titleSub:    { fontFamily: 'Arimo-Bold', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', lineHeight: 22 },
  titleScript: { fontFamily: 'Brittany-Signature', paddingLeft: 1, fontSize: 28, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18, lineHeight: 22, includeFontPadding: false },
  subtitle:    { fontFamily: 'Arimo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.3, marginTop: 4 },

  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  btnWrapper:   { width: '60%' },
  btnPressable: { borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  btnGradient:  { paddingVertical: 15, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  btnText:      { fontFamily: 'Arimo-Bold', fontSize: 14, fontWeight: '600', letterSpacing: 0.6, color: '#ffffff' },

  neonWrapper: { position: 'relative' },
  neonClip: {
    position: 'absolute',
    top: -1, left: -1, right: -1, bottom: -0.5,
    borderRadius: 21, overflow: 'hidden', zIndex: 2,
  },
  neonTrack: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask: {
    position: 'absolute',
    top: 1, left: 1, right: 1, bottom: 0.5,
    borderRadius: 20, zIndex: 1,
  },
  bloomMid: {
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 24, backgroundColor: 'transparent',
    shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 8,
  },
  bloomFar: {
    position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 28, backgroundColor: 'transparent',
    shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 28, elevation: 4,
  },
  floorGlow: {
    position: 'absolute', bottom: -16, alignSelf: 'center',
    width: '80%', height: 24, borderRadius: 50, backgroundColor: 'transparent',
    shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },

  planWrapper:      { flex: 1, position: 'relative', marginBottom: 12 },
  touchableArea:    { flex: 1 },
  planCard: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 120,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 2,
    zIndex: 3,
  },
  planCardSelected: { backgroundColor: '#030814', borderWidth: 0 },
  badge: {
    position: 'absolute', top: 0, right: 0, zIndex: 20,
    paddingHorizontal: 15, paddingVertical: 6,
    borderBottomLeftRadius: 15, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderTopRightRadius: 20,
  },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  planHeader:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  iconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(30,155,255,0.4)',
  },
  planIconGlow:     { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  featureIconGlow:  { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  planName:         { fontFamily: 'Brittany-Signature', fontSize: 26, fontWeight: '700', color: colors.text.secondary, paddingBottom: 5 },
  planNameSelected: { color: '#ffffff', fontWeight: '800' },
  planPrice:        { fontFamily: 'Arimo-Bold', fontSize: 20, fontWeight: '800', color: colors.text.primary },
  planPriceSelected:{ color: '#ffffff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  planDesc:         { fontFamily: 'Arimo-Regular', fontSize: 12, color: colors.text.muted, marginTop: 2 },
  featuresList:     { gap: 8, paddingLeft: 4 },
  featureRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText:         { fontFamily: 'Arimo-Regular', fontSize: 13, color: colors.text.secondary },
  featureTextSelected: { color: 'rgba(255,255,255,0.85)' },
  agencyRow:    { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  agencyText:   { fontFamily: 'Arimo-Bold', fontSize: 13, fontWeight: '700', color: colors.text.primary },
});