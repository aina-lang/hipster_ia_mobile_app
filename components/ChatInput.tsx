import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
} from 'react-native';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { TypingPlaceholder } from './TypingMessage';
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const NEON_BLUE = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;

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
    placeholderText = 'On brainstorm autour d’un café ? ☕',
    maxLength = 500,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const loop = useRef<Animated.CompositeAnimation | null>(null);
    const scale = useSharedValue(1);

    const isNeonActive = isFocused || !!inputValue.trim() || !!selectedImage;
    const isSendDisabled = (!inputValue.trim() && !selectedImage) || isGenerating || isDisabled;

    useEffect(() => {
        loop.current?.stop();
        if (isNeonActive) {
            translateX.setValue(0);
            loop.current = Animated.loop(
                Animated.timing(translateX, {
                    toValue: -800,
                    duration: 2400,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                { resetBeforeIteration: true }
            );
            loop.current.start();
        } else {
            translateX.setValue(0);
        }
        return () => loop.current?.stop();
    }, [isNeonActive]);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => { if (!isSendDisabled) scale.value = withSpring(0.92); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    return (
        <View style={[s.outerWrapper, { opacity: isDisabled ? 0.6 : 1 }]}>

            {isNeonActive && (
                <>
                    <View style={s.neonClip} pointerEvents="none">
                        <Animated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
                            <LinearGradient
                                colors={['transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent', 'transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent']}
                                locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{ width: 1600, height: '100%' }}
                            />
                        </Animated.View>
                        <View style={s.neonMask} />
                    </View>
                </>
            )}


            <View style={[s.inner, isNeonActive && s.innerActive]}>
                <TypingPlaceholder text={placeholderText} inputValue={inputValue} />
                <TextInput
                    value={inputValue}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline
                    maxLength={maxLength}
                    placeholderTextColor="transparent"
                    style={s.textInput}
                    editable={!isDisabled}
                />

                {selectedImage && (
                    <View style={s.imagePreview}>
                        <Image source={{ uri: selectedImage }} style={s.imagePreviewImg} />
                        <TouchableOpacity onPress={onImageRemove} style={s.imageRemoveBtn}>
                            <X size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={s.row}>
                    <View style={s.leftActions}>
                        <TouchableOpacity style={s.iconBtn} onPress={onImageSelect}>
                            <View style={selectedImage ? s.iconGlowActive : undefined}>
                                <ImageIcon
                                    size={20}
                                    color={selectedImage ? NEON_BLUE : colors.text.secondary}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={s.sendWrapper}>
                        {!isSendDisabled && !isGenerating && (
                            <>
                                <View style={[s.sendBloomFar, { shadowColor: NEON_BLUE }]} pointerEvents="none" />
                                <View style={[s.sendBloomMid, { shadowColor: NEON_BLUE }]} pointerEvents="none" />
                                <View style={[s.sendBorderGlow, { shadowColor: NEON_BLUE }]} pointerEvents="none" />
                            </>
                        )}
                        <AnimatedTouchable
                            onPress={onSend}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={isSendDisabled}
                            style={[
                                s.sendBtn,
                                { backgroundColor: isSendDisabled ? 'rgba(255,255,255,0.05)' : NEON_BLUE },
                                animatedButtonStyle,
                            ]}
                        >
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

const s = StyleSheet.create({
    outerWrapper: {
        position: 'relative',
        overflow: 'visible',
    },

    neonClip: {
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        bottom: -0.5,
        borderRadius: 17,
        overflow: 'hidden',
        zIndex: 2,
    },
    neonTrack: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
    },
    neonMask: {
        position: 'absolute',
        top: 1,
        left: 1,
        right: 1,
        bottom: 0.5,
        borderRadius: 16,
        zIndex: 1,
        backgroundColor: '#0f172a',
    },
    bloomMid: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 20,
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 6,
    },
    bloomFar: {
        position: 'absolute',
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        borderRadius: 24,
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 4,
    },

    staticGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 16,
        backgroundColor: 'transparent',
        shadowColor: NEON_BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
    },
    staticBloom: {
        position: 'absolute',
        top: -4, left: -4, right: -4, bottom: -4,
        borderRadius: 20,
        backgroundColor: 'transparent',
        shadowColor: NEON_BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 4,
    },

    inner: {
        borderRadius: 16,
        borderColor: colors.white + '14',
        backgroundColor: colors.darkSlateBlue,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 14,
        zIndex: 3,
    },
    innerActive: {
        borderWidth: 0,
    },

    textInput: {
        marginBottom: 12,
        maxHeight: 120,
        minHeight: 40,
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 0,
        color: '#cbd5e1',
        textAlignVertical: 'center',
    },

    imagePreview: {
        marginBottom: 16,
        position: 'relative',
        width: 80,
        height: 80,
    },
    imagePreviewImg: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    imageRemoveBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        borderRadius: 99,
        backgroundColor: '#ef4444',
        padding: 4,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 8,
    },
    iconGlowActive: {
        shadowColor: NEON_BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },

    sendWrapper: {
        position: 'relative',
        overflow: 'visible',
    },
    sendBorderGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 12,
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 10,
    },
    sendBloomMid: {
        position: 'absolute',
        top: -2, left: -2, right: -2, bottom: -2,
        borderRadius: 14,
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 6,
    },
    sendBloomFar: {
        position: 'absolute',
        top: -4, left: -4, right: -4, bottom: -4,
        borderRadius: 16,
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 3,
    },
    sendBtn: {
        borderRadius: 12,
        padding: 12,
        minWidth: 46,
        alignItems: 'center',
        justifyContent: 'center',
    },
});