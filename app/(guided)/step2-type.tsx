import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { useCreationStore, CreationCategory } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import {
    Palette,
    Globe,
    Mail,
    Video,
    Music,
    Smartphone,
    FileText,
    Ticket,
    ChevronRight,
} from 'lucide-react-native';

interface JobFunction {
    label: string;
    category: CreationCategory;
    icon: any;
}

const UNIVERSAL_FUNCTIONS: JobFunction[] = [
    { label: 'Visuel publicitaire', category: 'Image', icon: Palette },
    { label: 'Contenu réseaux', category: 'Social', icon: Smartphone },
    { label: 'Flyers', category: 'Image', icon: FileText },
    { label: 'Aperçu avant impression', category: 'Image', icon: Ticket },
    { label: 'Page web / SEO', category: 'Texte', icon: Globe },
    { label: 'Email marketing', category: 'Texte', icon: Mail },
    // { label: 'Vidéo publicitaire', category: 'Video', icon: Video },
    // { label: 'Voix-off / Son', category: 'Audio', icon: Music },
];

export default function Step2TypeScreen() {
    const router = useRouter();
    const { selectedJob, setFunction, selectedFunction } = useCreationStore();

    const handleSelectFunction = (fn: JobFunction) => {
        setFunction(fn.label, fn.category);
        setTimeout(() => {
            router.push('/(guided)/step3-personalize');
        }, 300);
    };

    return (
        <GuidedScreenWrapper>
            <View style={{ paddingHorizontal: 20, }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Que souhaitez-vous produire ?</Text>
                    <View style={styles.breadcrumb}>
                        <Text style={styles.breadcrumbJob}>{selectedJob}</Text>
                        <ChevronRight size={14} color={colors.text.muted} />
                        <Text style={styles.breadcrumbCanal}>Canal</Text>
                    </View>
                </View>

                {/* LISTE */}
                <View style={styles.functionsList}>
                    {UNIVERSAL_FUNCTIONS.map((fn, index) => (
                        <SelectionCard
                            key={index}
                            label={fn.label}
                            icon={fn.icon}
                            selected={selectedFunction === fn.label}
                            onPress={() => handleSelectFunction(fn)}
                            fullWidth
                        />
                    ))}
                </View>
            </View>
        </GuidedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    breadcrumbJob: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    breadcrumbCanal: {
        fontSize: 14,
        color: '#9ca3af',
    },
    functionsList: {
        gap: 12,
    },
    backButton: {
        marginTop: 32,
        alignItems: 'center',
        paddingVertical: 16,
    },
    backText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.4)',
    },
});
