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
    image: any;
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
            style={[styles.wrapper, animatedStyle]}
            activeOpacity={0.9}
        >
            {/* ── Couches de glow EXTÉRIEURES — avant le container clippé ── */}
            {selected && (
                <>
                </>
            )}

            {/* ── Container principal clippé — image + overlay + contenu ── */}
            <View style={[
                styles.container,
                selected && styles.containerSelected,
            ]}>
                {/* Image de fond */}
                <Image
                    source={typeof image === 'string' ? { uri: image } : image}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />

                {/* Overlay gradient pour lisibilité */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.88)']}
                    style={StyleSheet.absoluteFill}
                />

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
        marginBottom: 20,
        position: 'relative',
    },

    // Container principal — overflow hidden pour clipper image + overlay
    container: {
        width: '100%',
        height: 110,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#111',
        justifyContent: 'flex-end',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
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
});