import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { TypingPlaceholder } from './TypingMessage';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const NEON_BLUE = '#1e9bff';
const NEON_GLOW_COLOR = '#1a8fff';

interface ChatInputProps {
    inputValue: string;
    onChangeText: (text: string) => void;
    selectedImage: string | null;
    onImageSelect: () => void;
    onImageRemove: () => void;
    onSend: () => void;
    isGenerating: boolean;
    isDisabled?: boolean;
    placeholderText?: string;
    maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    onChangeText,
    selectedImage,
    onImageSelect,
    onImageRemove,
    onSend,
    isGenerating,
    isDisabled = false,
    placeholderText = 'Décrivez votre idée, ajoutez une image ou un audio...',
    maxLength = 500,
}) => {
    const scale = useSharedValue(1);
    const isSendDisabled = (!inputValue.trim() && !selectedImage) || isGenerating || isDisabled;

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => { if (!isSendDisabled) scale.value = withSpring(0.92); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    return (
        <View style={{ position: 'relative', overflow: 'visible', opacity: isDisabled ? 0.6 : 1 }}>
            {/* ── Couches de glow du CONTAINER ── */}
            <View style={styles.inputBorderGlow} pointerEvents="none" />
            <View style={styles.inputBloomMid} pointerEvents="none" />

            <View
                className="relative rounded-2xl border bg-slate-900 p-4"
                style={{
                    borderColor: NEON_BLUE,
                    borderWidth: 1.5,
                }}
            >
                <TypingPlaceholder text={placeholderText} inputValue={inputValue} />
                <TextInput
                    value={inputValue}
                    onChangeText={onChangeText}
                    multiline
                    maxLength={maxLength}
                    placeholderTextColor="transparent"
                    className="mb-3 max-h-[100px] min-h-[24px] text-base text-slate-300"
                    editable={!isDisabled}
                />

                {selectedImage && (
                    <View className="mb-4 relative w-20 h-20">
                        <Image source={{ uri: selectedImage }} className="w-full h-full rounded-xl" />
                        <TouchableOpacity
                            onPress={onImageRemove}
                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 shadow-lg"
                        >
                            <X size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                <View className="flex-row items-center justify-between">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="rounded-lg bg-white/5 p-2"
                            onPress={onImageSelect}
                        >
                            <ImageIcon size={20} color={selectedImage ? colors.primary.main : colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ position: 'relative', overflow: 'visible' }}>
                        {!isSendDisabled && !isGenerating && (
                            <>
                                <View style={styles.bloomFar} pointerEvents="none" />
                                <View style={styles.bloomMid} pointerEvents="none" />
                                <View style={styles.borderGlow} pointerEvents="none" />
                            </>
                        )}
                        <AnimatedTouchable
                            onPress={onSend}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={isSendDisabled}
                            className="rounded-xl p-3"
                            style={[
                                {
                                    backgroundColor: isSendDisabled ? 'rgba(255,255,255,0.05)' : NEON_BLUE,
                                    minWidth: 46,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                                animatedButtonStyle,
                            ]}>
                            {isGenerating ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <Send size={20} color={isSendDisabled ? 'rgba(255,255,255,0.2)' : '#000'} />
                            )}
                        </AnimatedTouchable>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    borderGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 12,
        backgroundColor: 'transparent',
        shadowColor: NEON_GLOW_COLOR,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 10,
    },
    bloomMid: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 14,
        backgroundColor: 'transparent',
        shadowColor: '#0f60e0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 6,
    },
    bloomFar: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 16,
        backgroundColor: 'transparent',
        shadowColor: '#0840bb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 3,
    },
    inputBorderGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 16,
        backgroundColor: 'transparent',
        shadowColor: NEON_GLOW_COLOR,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 12,
    },
    inputBloomMid: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 18,
        backgroundColor: 'transparent',
        shadowColor: '#0f60e0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 6,
    },
});
