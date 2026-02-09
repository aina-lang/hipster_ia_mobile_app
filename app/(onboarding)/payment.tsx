import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { colors } from '../../theme/colors';
import { NeonButton } from '../../components/ui/NeonButton';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { Shield, Check } from 'lucide-react-native';

export default function OnboardingPaymentScreen() {
    const router = useRouter();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { user, updateAiProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Default to Curieux logic if not specified, but we expect to be here for Curieux mainly
    const planName = "Curieux";
    const price = "0€ pour 7 jours";
    const thenPrice = "29.90€/mois";

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // 1. Create Subscription Payment Sheet
            const response = await api.post('/ai/payment/create-payment-sheet', {
                priceId: 'price_Studio2990', // We use Studio price for the trial
                planId: 'curieux',
                userId: user?.id
            });

            const { paymentIntentClientSecret, setupIntentClientSecret, customerId, ephemeralKey } = response.data?.data || response.data;

            // 2. Initialize Stripe
            const initResponse = await initPaymentSheet({
                merchantDisplayName: 'Hipster IA',
                customerId,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret, // One of these will be present
                setupIntentClientSecret,   // One of these will be present
                defaultBillingDetails: {
                    name: user?.name,
                    email: user?.email
                }
            });

            if (initResponse.error) {
                Alert.alert('Erreur', initResponse.error.message);
                setLoading(false);
                return;
            }

            // 3. Present Payment Sheet
            const paymentResponse = await presentPaymentSheet();

            if (paymentResponse.error) {
                if (paymentResponse.error.code !== 'Canceled') {
                    Alert.alert('Erreur', paymentResponse.error.message);
                }
                setLoading(false);
                return;
            }

            // 4. Success handling
            setIsProcessing(true);

            // Confirm plan backend side (logic already handled by webhook for subscription status, 
            // but we might want to ensure local state is updated immediately)
            // For Curieux/Trial, we might not need an explicit confirm endpoint if webhook does it?
            // But confirmPlan can set limits immediately.
            await api.post('/ai/payment/confirm-plan', { planId: 'curieux' });
            await updateAiProfile({ planType: 'curieux', subscriptionStatus: 'active' });
            // Note: status might be 'active' locally to allow access, even if 'trialing' in Stripe.

            router.replace('/(drawer)');

        } catch (error: any) {
            console.error(error);
            Alert.alert('Erreur', error.message || "Une erreur est survenue");
            setLoading(false);
            setIsProcessing(false);
        }
    };

    return (
        <BackgroundGradientOnboarding blurIntensity={90}>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Shield size={48} color={colors.primary.main} />
                    </View>

                    <Text style={styles.title}>Commencez votre essai gratuit</Text>
                    <Text style={styles.subtitle}>
                        Vous avez choisi le pack <Text style={styles.highlight}>{planName}</Text>.
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Check size={20} color={colors.primary.main} />
                            <Text style={styles.feature}>7 jours offerts maintenant</Text>
                        </View>

                        <Text style={styles.disclaimer}>
                            Aucun prélèvement aujourd'hui. Une empreinte bancaire est nécessaire pour activer l'essai et éviter les abus.
                        </Text>
                    </View>

                </View>

                <View style={styles.footer}>
                    <NeonButton
                        title={loading || isProcessing ? "Traitement..." : "Activer mon essai (0€)"}
                        onPress={handleSubscribe}
                        disabled={loading || isProcessing}
                        loading={loading || isProcessing}
                        variant="premium"
                        size="lg"
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        </BackgroundGradientOnboarding>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(57, 255, 20, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(57, 255, 20, 0.3)',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    highlight: {
        color: colors.primary.main,
        fontWeight: '700',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    feature: {
        color: '#fff',
        fontSize: 16,
    },
    disclaimer: {
        marginTop: 16,
        fontSize: 12,
        color: colors.text.muted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    footer: {
        marginBottom: 20,
    },
    button: {
        width: '100%',
    },
});
