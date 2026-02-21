import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
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
        borderColor: selected ? '#94a3b8' : 'rgba(255,255,255,0.1)',
        borderWidth: selected ? 2 : 1,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, animatedStyle]}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: image }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />

            {/* Dark overlay for text readability */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                <View style={[
                    styles.iconContainer,
                    selected && { backgroundColor: 'rgba(148, 163, 184, 0.2)' }
                ]}>
                    <Icon size={20} color={selected ? '#ffffff' : 'rgba(255,255,255,0.6)'} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.label, selected && { color: '#ffffff' }]}>
                        {label}
                    </Text>
                </View>
            </View>

            {selected && (
                <View style={styles.glowOverlay} pointerEvents="none" />
            )}
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 110,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 14,
        backgroundColor: '#111',
        position: 'relative',
        justifyContent: 'flex-end',
    },
    content: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        zIndex: 10,
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
    textContainer: {
        flex: 1,
    },
    label: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
    }
});
