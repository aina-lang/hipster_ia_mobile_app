import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  LucideIcon, 
  CheckCircle2, 
  Image as ImageIcon,
  FileText, 
  Video, 
  Music, 
  Box, 
  Download, 
  XCircle, 
  Crown 
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { NeonBorderCard } from '../ui/NeonBorderCard';

const NEON_BLUE = '#00d4ff';

const PLAN_IMAGES: Record<string, any> = {
  atelier: require('../../assets/images/packs/atelier.png'),
  studio:  require('../../assets/images/packs/studio.png'),
};

export interface Plan {
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

function PlanIcon({ planId, size = 40, isSelected, isComingSoon }: {
  planId: string;
  size?: number;
  isSelected: boolean;
  isComingSoon?: boolean;
}) {
  const active = isSelected && !isComingSoon;
  const color  = active ? '#00eaff' : colors.text.muted;
  const glow   = active ? s.planIconGlow : undefined;

  if (planId === 'agence') {
    return <Crown size={size} color={color} style={glow} />;
  }

  const source = PLAN_IMAGES[planId];
  if (!source) return null;

  return (
    <View style={glow}>
      <Image
        source={source}
        style={{ width: size, height: size, tintColor: active ? '#00eaff' : colors.text.muted }}
        resizeMode="contain"
      />
    </View>
  );
}

const getFeatureIcon = (feature: string): LucideIcon => {
  const f = feature.toLowerCase();
  if (f.includes('image'))                                   return ImageIcon;
  if (f.includes('texte'))                                   return FileText;
  if (f.includes('vidéo'))                                   return Video;
  if (f.includes('sonore') || f.includes('audio'))           return Music;
  if (f.includes('3d') || f.includes('sketch'))              return Box;
  if (f.includes('export'))                                  return f.includes('pas') ? XCircle : Download;
  if (f.includes('accompagnement') || f.includes('hipster')) return Crown;
  return CheckCircle2;
};

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  loading: boolean;
}

export function PlanCard({ plan, isSelected, onSelect, loading }: PlanCardProps) {
  const isComingSoon = plan.isComingSoon;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn  = () => { if (!loading && !isComingSoon) scale.value = withSpring(0.97, { damping: 15 }); };
  const handlePressOut = () => { if (!loading && !isComingSoon) scale.value = withSpring(1,    { damping: 15 }); };

  const active = isSelected && !isComingSoon;

  return (
    <Animated.View style={[s.planWrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={loading || isComingSoon}
        style={[s.touchableArea, isComingSoon && { opacity: 0.5 }]}
      >
        <NeonBorderCard isSelected={isSelected}>
          <View style={[s.planCard, active && s.planCardSelected]}>

            {plan.popular && !isComingSoon && (
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
            {isComingSoon && (
              <View style={[s.badge, { backgroundColor: '#334155' }]}>
                <Text style={s.badgeText}>À VENIR</Text>
              </View>
            )}

            <View style={s.planHeader}>
              <View style={[s.iconBox, active && s.iconBoxActive]}>
                <PlanIcon
                  planId={plan.id}
                  size={40}
                  isSelected={isSelected}
                  isComingSoon={isComingSoon}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  s.planName,
                  active && s.planNameSelected,
                  isComingSoon && { color: colors.text.muted },
                ]}>
                  {plan.name}
                </Text>
                <Text style={[
                  s.planPrice,
                  active && s.planPriceSelected,
                  isComingSoon && { color: colors.text.muted },
                ]}>
                  {plan.price}
                  {typeof plan.price === 'string' && plan.price.toLowerCase().includes('€') ? (
                    <Text style={[s.pricePeriod, active && s.pricePeriodSelected]}>/mois</Text>
                  ) : null}
                </Text>
                {plan.description && (
                  <Text style={s.planDesc}>{plan.description}</Text>
                )}
              </View>
            </View>

            <View style={s.featuresList}>
              {plan.features.map((feature, idx) => {
                const FeatureIcon      = getFeatureIcon(feature);
                const isAccompagnement = feature.toLowerCase().includes('accompagnement');
                return (
                  <View key={idx} style={[s.featureRow, isAccompagnement && s.agencyRow]}>
                    <View style={active ? s.featureIconGlow : undefined}>
                      <FeatureIcon
                        size={14}
                        color={
                          active
                            ? '#ffffff'
                            : isAccompagnement ? colors.text.primary : colors.text.muted
                        }
                      />
                    </View>
                    <Text style={[
                      s.featureText,
                      isAccompagnement && s.agencyText,
                      active && s.featureTextSelected,
                    ]}>
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
}

const s = StyleSheet.create({
  planWrapper:   { flex: 1, position: 'relative', marginBottom: 12 },
  touchableArea: { flex: 1 },
  planCard: {
    backgroundColor: '#0f172aeb',
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
  planIconGlow: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  // Même style que planPriceSelected mais pour les icônes features
  featureIconGlow: {
    shadowColor: NEON_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  planName: {
    fontFamily: 'Brittany-Signature',
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.secondary,
    paddingBottom: 5,
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
    color: colors.text.muted,
  },
  pricePeriodSelected: {
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
});