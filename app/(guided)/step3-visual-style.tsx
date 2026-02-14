import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, VisualStyle } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { Moon, Sun, Zap } from 'lucide-react-native';

const VISUAL_STYLES: { label: VisualStyle; displayName: string; icon: any; description: string }[] = [
    { label: 'Monochrome', displayName: 'Noir et blanc', icon: Moon, description: 'Contraste élevé, très classe' },
    { label: 'Hero Studio', displayName: 'Photos réelles', icon: Zap, description: 'Vraies personnes, vraies situations' },
    { label: 'Minimal Studio', displayName: 'Propre et simple', icon: Sun, description: 'Sujet bien visible, fond épuré' },
];

export default function Step3VisualStyleScreen() {
    const router = useRouter();
    const { selectedStyle, setStyle } = useCreationStore();

    const handleSelectStyle = (style: VisualStyle) => {
        setStyle(style);
        setTimeout(() => {
            router.push('/(guided)/step3-visual-upload');
        }, 300);
    };

    return (
        <GuidedScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Choisissez le style artistique</Text>
                    <Text style={styles.subtitle}>Sélectionnez l'ambiance visuelle pour votre création</Text>
                </View>

                {/* Style Options */}
                <View style={styles.optionsList}>
                    {VISUAL_STYLES.map((style) => (
                        <SelectionCard
                            key={style.label}
                            label={style.displayName}
                            icon={style.icon}
                            selected={selectedStyle === style.label}
                            onPress={() => handleSelectStyle(style.label)}
                            fullWidth
                        >
                            <Text style={styles.description}>{style.description}</Text>
                        </SelectionCard>
                    ))}
                </View>
            </View>
        </GuidedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
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
});
