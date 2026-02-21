import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { JobTypeCard } from '../../components/ui/JobTypeCard';
import { useCreationStore, CreationCategory } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import {
    Palette,
    Globe,
    Mail,
    Smartphone,
    FileText,
    Ticket,
    ChevronRight,
} from 'lucide-react-native';

interface JobFunction {
    label: string;
    category: CreationCategory;
    icon: any;
    image: string;
}

const UNIVERSAL_FUNCTIONS: JobFunction[] = [
    {
        label: 'Visuel publicitaire',
        category: 'Image',
        icon: Palette,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'
    },
    {
        label: 'Contenu réseaux',
        category: 'Social',
        icon: Smartphone,
        image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=600&auto=format&fit=crop'
    },
    {
        label: 'Flyers',
        category: 'Image',
        icon: FileText,
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop'
    },
    {
        label: 'Aperçu avant impression',
        category: 'Image',
        icon: Ticket,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop'
    },
    {
        label: 'Page web / SEO',
        category: 'Texte',
        icon: Globe,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'
    },
    {
        label: 'Email marketing',
        category: 'Texte',
        icon: Mail,
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop'
    },
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
            <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
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
                        <JobTypeCard
                            key={index}
                            label={fn.label}
                            icon={fn.icon}
                            image={fn.image}
                            selected={selectedFunction === fn.label}
                            onPress={() => handleSelectFunction(fn)}
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
