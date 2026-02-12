import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonButton } from '../../components/ui/NeonButton';
import {
    TrendingUp,
    Gem,
    BookOpen,
    Target,
    GraduationCap,
    Megaphone,
    Gift,
    RotateCcw,
    Handshake,
    Newspaper,
    Zap,
    Trophy,
    Building2,
    ShoppingBag,
    Calendar,
    Mail,
    Heart,
    Plus,
    Sparkles
} from 'lucide-react-native';

interface IntentionOption {
    label: string;
    icon: any;
    description: string;
}

const TEXTE_MARKETING_INTENTIONS: IntentionOption[] = [
    { label: 'Promotion', icon: TrendingUp, description: 'Mettre en avant une offre, réduction, lancement' },
    { label: 'Valorisation produit', icon: Gem, description: 'Mettre en avant bénéfices, avantages, différenciation' },
    { label: 'Storytelling', icon: BookOpen, description: 'Raconter une histoire autour de la marque ou du produit' },
    { label: 'Conversion directe', icon: Target, description: 'Appel à l\'action clair et agressif (acheter, réserver, s\'inscrire)' },
    { label: 'Éducation / Explication', icon: GraduationCap, description: 'Expliquer comment ça marche, rassurer, informer' },
];

const EMAIL_INTENTIONS: IntentionOption[] = [
    { label: 'Annonce / Lancement', icon: Megaphone, description: 'Annoncer une nouveauté ou un lancement' },
    { label: 'Offre promotionnelle', icon: Gift, description: 'Proposer une offre spéciale ou réduction' },
    { label: 'Relance panier / inactif', icon: RotateCcw, description: 'Rappeler un panier abandonné ou réactiver' },
    { label: 'Relationnel / fidélisation', icon: Handshake, description: 'Renforcer la relation client' },
    { label: 'Newsletter informative', icon: Newspaper, description: 'Partager des actualités et informations' },
    { label: 'Conversion rapide', icon: Zap, description: 'Inciter à une action immédiate' },
];

const PAGE_WEB_INTENTIONS: IntentionOption[] = [
    { label: 'Page de vente (conversion)', icon: Trophy, description: 'Optimisée pour convertir les visiteurs' },
    { label: 'Présentation entreprise', icon: Building2, description: 'Présenter votre activité et vos valeurs' },
    { label: 'Présentation produit', icon: ShoppingBag, description: 'Détailler un produit ou service' },
    { label: 'Landing page événement', icon: Calendar, description: 'Promouvoir un événement spécifique' },
    { label: 'Page capture email (lead magnet)', icon: Mail, description: 'Collecter des emails avec une offre' },
    { label: 'Page storytelling marque', icon: Heart, description: 'Raconter l\'histoire de votre marque' },
];

export default function Step3TextIntentionScreen() {
    const router = useRouter();
    const { selectedFunction, selectedIntention, setIntention } = useCreationStore();
    const [customIntention, setCustomIntention] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(selectedIntention);

    // Determine which intentions to show based on selectedFunction
    const getIntentions = (): IntentionOption[] => {
        if (selectedFunction?.includes('Texte marketing')) {
            return TEXTE_MARKETING_INTENTIONS;
        } else if (selectedFunction?.includes('Email')) {
            return EMAIL_INTENTIONS;
        } else if (selectedFunction?.includes('Page web')) {
            return PAGE_WEB_INTENTIONS;
        }
        // Default fallback
        return TEXTE_MARKETING_INTENTIONS;
    };

    const intentions = getIntentions();
    const isCustomSelected = selectedOption === 'Autre';

    const handleSelectIntention = (intention: string) => {
        setSelectedOption(intention);
        if (intention !== 'Autre') {
            setCustomIntention('');
        }
    };

    const handleContinue = () => {
        const finalIntention = isCustomSelected && customIntention.trim()
            ? customIntention.trim()
            : selectedOption;

        if (!finalIntention) {
            return;
        }

        setIntention(finalIntention as any);
        setTimeout(() => {
            router.push('/(guided)/step3-result');
        }, 300);
    };

    const canContinue = selectedOption && (!isCustomSelected || customIntention.trim());

    return (
        <GuidedScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Quelle est l'intention ?</Text>
                        <Text style={styles.subtitle}>Définissez l'objectif de votre contenu</Text>
                    </View>

                    {/* Intention Options */}
                    <View style={styles.optionsList}>
                        {intentions.map((intention) => (
                            <SelectionCard
                                key={intention.label}
                                label={intention.label}
                                icon={intention.icon}
                                selected={selectedOption === intention.label}
                                onPress={() => handleSelectIntention(intention.label)}
                                fullWidth
                            >
                                <Text style={styles.description}>{intention.description}</Text>
                            </SelectionCard>
                        ))}

                        {/* Autre option */}
                        <SelectionCard
                            label="Autre"
                            icon={Plus}
                            selected={isCustomSelected}
                            onPress={() => handleSelectIntention('Autre')}
                            fullWidth
                        >
                            <Text style={styles.description}>Définir une intention personnalisée</Text>
                        </SelectionCard>
                    </View>

                    {/* Custom Input */}
                    {isCustomSelected && (
                        <View style={styles.customInputSection}>
                            <View style={styles.divider} />
                            <Text style={styles.customInputLabel}>Précisez votre intention :</Text>
                            <TextInput
                                style={[styles.textInput, customIntention.trim() ? styles.textInputActive : null]}
                                placeholder="Ex: Rassurer sur la qualité, Créer l'urgence..."
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                value={customIntention}
                                onChangeText={setCustomIntention}
                                autoFocus
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    )}
                </ScrollView>

                {/* Footer Button */}
                <View style={styles.footer}>
                    <NeonButton
                        onPress={handleContinue}
                        title="Continuer"
                        variant="premium"
                        size="lg"
                        icon={<Sparkles size={18} color={colors.text.primary} />}
                        disabled={!canContinue}
                    />
                </View>
            </KeyboardAvoidingView>
        </GuidedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    optionsList: {
        gap: 12,
    },
    description: {
        fontSize: 14,
        color: colors.text.muted,
        marginTop: 4,
    },
    customInputSection: {
        marginTop: 24,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 24,
    },
    customInputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 12,
    },
    textInput: {
        minHeight: 80,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        color: '#FFFFFF',
        textAlignVertical: 'top',
    },
    textInputActive: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.main + '0D',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 16,
    },
});
