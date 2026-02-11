import React from 'react';
import { View, Text } from 'react-native';
import { Lock, CreditCard } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { NeonButton } from './ui/NeonButton';

interface PaymentBlockerProps {
    plan: any;
    onPay: () => void;
    loading: boolean;
}

export const PaymentBlocker = ({ plan, onPay, loading }: PaymentBlockerProps) => {
    const isTrial = plan?.id === 'curieux';

    if (!plan) return null;

    return (
        <View className=" mb-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl">
            <View className="bg-primary/10 p-6 items-center">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <Lock size={32} color={colors.primary.main} />
                </View>
                <Text className="text-center text-xl font-bold text-white">Action requise</Text>
                <Text className="mt-2 text-center text-sm text-white/60">
                    {isTrial
                        ? "Démarrez votre essai gratuit pour accéder à tout. Carte requise (0€). Passage automatique au pack Atelier (9,90€/mois) après 7 jours."
                        : "Veuillez finaliser votre abonnement pour débloquer toutes les fonctionnalités de votre plan."}
                </Text>
            </View>

            <View className="border-t border-white/5 p-6">
                <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
                    <View>
                        <Text className="text-xs font-medium text-white/40 uppercase tracking-wider">Plan sélectionné</Text>
                        <Text className="mt-1 text-lg font-bold text-white">{plan.name}</Text>
                    </View>
                    <Text className="text-lg font-black text-primary" style={{ color: colors.primary.main }}>
                        {isTrial ? "0€ l'essai" : plan.price}
                    </Text>
                </View>

                <NeonButton
                    title={isTrial ? "Démarrer l'essai (0€)" : "Procéder au paiement"}
                    onPress={onPay}
                    loading={loading}
                    variant="premium"
                    size="lg"
                    icon={<CreditCard size={20} color={colors.text.primary} />}
                />
                {isTrial && (
                    <Text className="mt-3 text-center text-xs text-white/40">
                        Aucun prélèvement immédiat. Annulable à tout moment.
                    </Text>
                )}
            </View>
        </View>
    );
};
