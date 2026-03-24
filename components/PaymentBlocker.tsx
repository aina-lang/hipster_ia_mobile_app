import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, ActivityIndicator } from 'react-native';
import { Lock, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const NEON_BLUE = '#00eaff';

interface PaymentBlockerProps {
    plan: any;
    onPay: () => void;
    loading: boolean;
}

export const PaymentBlocker = ({ plan, onPay, loading }: PaymentBlockerProps) => {
    const isTrial      = plan?.id === 'curieux';
    const promptsLimit = plan?.promptsLimit || 0;
    const promptsUsed  = plan?.promptsUsed  || 0;
    const imagesLimit  = plan?.imagesLimit  || 0;
    const imagesUsed   = plan?.imagesUsed   || 0;
    const videosLimit  = plan?.videosLimit  || 0;
    const videosUsed   = plan?.videosUsed   || 0;
    const audioLimit   = plan?.audioLimit   || 0;
    const audioUsed    = plan?.audioUsed    || 0;
    const threeDLimit  = plan?.threeDLimit  || 0;
    const threeDUsed   = plan?.threeDUsed   || 0;

    const isExhausted =
        (promptsLimit > 0 && promptsLimit !== 999999 ? promptsUsed >= promptsLimit : true) &&
        (imagesLimit  > 0 && imagesLimit  !== 999999 ? imagesUsed  >= imagesLimit  : true) &&
        (videosLimit  > 0 && videosLimit  !== 999999 ? videosUsed  >= videosLimit  : true) &&
        (audioLimit   > 0 && audioLimit   !== 999999 ? audioUsed   >= audioLimit   : true) &&
        (threeDLimit  > 0 && threeDLimit  !== 999999 ? threeDUsed  >= threeDLimit  : true);

    const getMessage = () => {
        if (isExhausted) return "Vous avez atteint votre limite de génération pour cette période. Renouvelez votre forfait ou passez au niveau supérieur pour obtenir de nouveaux crédits immédiatement.";
        if (isTrial)     return "Profitez de 7 jours d'essais gratuit.\n Aucun prélèvement immédiat :\n votre carte est simplement securisée. \n A l'issue de l'essai, sans résiliation, l'abonnement atelier sera automatiquement lancé.";
        return "Veuillez finaliser votre abonnement pour débloquer toutes les fonctionnalités de votre plan.";
    };

    const getTitle = () => isExhausted ? "Limite atteinte" : "Action requise";

    const scale    = useRef(new RNAnimated.Value(1)).current;
    const pressIn  = () => RNAnimated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
    const pressOut = () => RNAnimated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

    return (
        <View style={s.card}>
            <View style={s.topSection}>
                <View style={s.iconGlow}>
                    <View style={s.iconBox}>
                        <Lock
                            size={32}
                            color="#ffffff"
                            style={{ shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 }}
                        />
                    </View>
                </View>
                <Text style={s.title}>{getTitle()}</Text>
                <Text style={s.message}>{getMessage()}</Text>
            </View>

            <View style={s.bottomSection}>
                <View style={s.planRow}>
                    <Text style={s.planLabel}>Plan sélectionné</Text>
                    <View style={s.planNamePriceRow}>
                        <Text style={s.planName}>{plan.name}</Text>
                        <Text style={s.planPrice}>{isTrial ? "0€ l'essai" : plan.price}</Text>
                    </View>
                </View>

                <RNAnimated.View style={[s.btnWrapper, { transform: [{ scale }] }]}>
                    <Pressable
                        onPress={onPay}
                        onPressIn={pressIn}
                        onPressOut={pressOut}
                        disabled={loading}
                        style={s.btnPressable}
                    >
                        <LinearGradient
                            colors={['#264F8C', '#0a1628', '#040612']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            locations={[0, 0.46, 1]}
                            style={s.btnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <>
                                    <CreditCard size={18} color="#ffffff" />
                                    <Text style={s.btnText}>
                                        {isTrial ? "Démarrer l'essai (0€)" : "Procéder au paiement"}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>
                </RNAnimated.View>

                {isTrial && (
                    <Text style={s.trialNote}>Aucun prélèvement immédiat. Annulable à tout moment.</Text>
                )}
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    card: {
        marginBottom: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        backgroundColor: 'rgba(15,23,42,0.90)',
        overflow: 'hidden',
    },
    topSection: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(0,212,255,0.04)',
    },
    iconGlow: {
        marginBottom: 16
    },
    iconBox: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,212,255,0.25)',
    },
    title: {
        fontFamily: 'Arimo-Bold',
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontFamily: 'Arimo-Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSection: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        gap: 16,
    },
    planRow: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    planLabel: {
        fontFamily: 'Arimo-Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    planNamePriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    planName: {
        fontFamily: 'Brittany-Signature',
        paddingVertical: 5,
        fontSize: 28,
        color: '#fff',
        textShadowColor: NEON_BLUE,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    planPrice: {
        fontFamily: 'Arimo-Bold',
        fontSize: 18,
        color: '#ffffff',
        textShadowColor: NEON_BLUE,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    btnWrapper: {
        alignSelf: 'stretch',
    },
    btnPressable: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.42)',
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 18,
        minHeight: 50,
    },
    btnText: {
        fontFamily: 'Arimo-Bold',
        fontSize: 15,
        letterSpacing: 0.4,
        color: '#ffffff',
    },
    trialNote: {
        fontFamily: 'Arimo-Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
    },
});