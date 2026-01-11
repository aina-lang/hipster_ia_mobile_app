import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { ChevronLeft, Check, Crown, Zap, Shield, LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_URL = 'http://192.168.1.100:3000'; // Replace with your actual API URL

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  stripePriceId: string | null;
  icon: LucideIcon;
  popular?: boolean;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Mocking for now:
      const mockPlans: Plan[] = [
        {
          id: 'basic',
          name: 'Gratuit',
          price: '0€',
          description: 'Pour découvrir Hipster',
          features: ['10 crédits/mois', 'Support standard', 'Qualité standard'],
          stripePriceId: null,
          icon: Shield,
        },
        {
          id: 'pro',
          name: 'Premium Pro',
          price: '19.99€',
          description: 'Pour les créateurs passionnés',
          features: ['500 crédits/mois', 'Support prioritaire', 'Qualité HD', 'Sans filigrane'],
          stripePriceId: 'price_HpsPro123',
          icon: Zap,
          popular: true,
        },
        {
          id: 'enterprise',
          name: 'Entreprise',
          price: '49.99€',
          description: 'La puissance illimitée',
          features: ['Illimité', 'Accès API', 'Support 24/7', "Compte d'équipe"],
          stripePriceId: 'price_HpsEnt456',
          icon: Crown,
        },
      ];
      setPlans(mockPlans);
      setSelectedPlan('pro');
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const initializePaymentSheet = async (priceId: string) => {
    setLoading(true);
    try {
      Alert.alert(
        'Mode Demo',
        "L'intégration Stripe est prête. Le backend doit être accessible pour initier le paiement réel.",
        [{ text: 'OK' }]
      );

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan || !plan.stripePriceId) return;

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
        <View style={styles.topSection}>
          <Text style={styles.title}>Passez au niveau supérieur</Text>
          <Text style={styles.subtitle}>Libérez votre créativité avec nos outils premium</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
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
                  <plan.icon
                    size={24}
                    color={selectedPlan === plan.id ? colors.primary.main : colors.text.muted}
                  />
                </View>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    {plan.price}
                    <Text style={styles.pricePeriod}>/mois</Text>
                  </Text>
                </View>
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={16} color={colors.primary.main} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.upgradeButton, loading && styles.disabledButton]}
          onPress={handleUpgrade}
          disabled={loading || selectedPlan === 'basic'}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.upgradeButtonText}>
              {selectedPlan === 'basic' ? 'Plan actuel' : 'Commencer maintenant'}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>Paiement sécurisé via Stripe</Text>
      </View>
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
