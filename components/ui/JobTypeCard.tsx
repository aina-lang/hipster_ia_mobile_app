import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface JobTypeCardProps {
    label: string;
    image: string;
    icon: LucideIcon;
    selected: boolean;
    onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const JobTypeCard: React.FC<JobTypeCardProps> = ({
    label,
    image,
    icon: Icon,
    selected,
    onPress,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => { scale.value = withSpring(0.97); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    return (
        // Wrapper externe : overflow visible pour laisser le glow sortir
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            // style={[styles.wrapper, animatedStyle]}
            activeOpacity={0.9}
        >
            {/* ── Couches de glow EXTÉRIEURES — avant le container clippé ── */}
            {selected && (
                <>
                    {/* Glow lointain très diffus */}
                    <View style={styles.bloomFar} pointerEvents="none" />
                    {/* Glow moyen */}
                    <View style={styles.bloomMid} pointerEvents="none" />
                    {/* Halo serré sur la bordure */}
                    <View style={styles.borderGlow} pointerEvents="none" />
                    {/* Halo au sol */}
                    <View style={styles.floorGlow} pointerEvents="none" />
                </>
            )}

            {/* ── Container principal clippé — image + overlay + contenu ── */}
            <View style={[
                styles.container,
                selected && styles.containerSelected,
            ]}>
                {/* Image de fond */}
                <Image
                    source={{ uri: image }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />

                {/* Overlay gradient pour lisibilité — retiré si sélectionné pour un look plus clean */}
                {!selected && (
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.88)']}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                {/* Si sélectionné : reflet neon bleu en haut de la bordure */}
                {selected && (
                    <LinearGradient
                        colors={['rgba(80, 170, 255, 0.22)', 'transparent']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 0.4 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                {/* Contenu */}
                <View style={styles.content}>
                    <View style={[
                        styles.iconContainer,
                        selected && styles.iconContainerSelected,
                    ]}>
                        <Icon size={20} color={selected ? '#ffffff' : 'rgba(255,255,255,0.6)'} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.label, selected && styles.labelSelected]}>
                            {label}
                        </Text>
                    </View>
                </View>
            </View>
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    // Wrapper externe — overflow visible pour le glow, pas de background
    wrapper: {
        marginBottom: 14,
        position: 'relative',
    },

    // Container principal — overflow hidden pour clipper image + overlay
    container: {
        height: 110,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#111',
        justifyContent: 'flex-end',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    containerSelected: {
        borderWidth: 2,
        borderColor: '#1e9bff',
    },

    content: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },

    iconContainerSelected: {
        backgroundColor: 'rgba(30, 155, 255, 0.2)',
        borderColor: '#1e9bff',
    },

    textContainer: {
        flex: 1,
    },

    label: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    labelSelected: {
        color: '#ffffff',
    },

    // ── Couches glow — positionnées par rapport au wrapper ──

    // Halo serré exactement sur la bordure
    borderGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: 'transparent',
        shadowColor: '#1a8fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 28,
        elevation: 14,
    },

    // Bloom moyen
    bloomMid: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 24,
        backgroundColor: 'transparent',
        shadowColor: '#0f60e0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 8,
    },

    // Bloom lointain très diffus
    bloomFar: {
        position: 'absolute',
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        borderRadius: 28,
        backgroundColor: 'transparent',
        shadowColor: '#0840bb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 4,
    },

    // Halo elliptique au sol
    floorGlow: {
        position: 'absolute',
        bottom: -30,
        alignSelf: 'center',
        width: 160,
        height: 40,
        borderRadius: 80,
        backgroundColor: 'transparent',
        shadowColor: '#1a6fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
        elevation: 20,
    },
});