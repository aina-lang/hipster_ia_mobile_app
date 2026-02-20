import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInRight, FadeInDown, runOnJS } from 'react-native-reanimated';
import { Upload, Palette, User } from 'lucide-react-native';
import ColorPicker, { HueSlider, Panel1, Preview, OpacitySlider } from 'reanimated-color-picker';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';

export default function BrandingScreen() {
    const router = useRouter();
    const { finishOnboarding } = useAuthStore();
    const {
        brandingColor, setBrandingData,
        logoUri, avatarUri
    } = useOnboardingStore();
    const { user } = useAuthStore();

    const initialImage = user?.avatarUrl || user?.logoUrl || avatarUri || logoUri;

    const [selectedColor, setSelectedColor] = useState(user?.brandingColor || brandingColor || '#FF0000');
    const [localImage, setLocalImage] = useState(initialImage);
    const [localLoading, setLocalLoading] = useState(false);
    const [tempHex, setTempHex] = useState(selectedColor.toUpperCase());

    const handleHexChange = (text: string) => {
        const sanitized = text.toUpperCase().replace(/[^0-9A-F#]/g, '');
        setTempHex(sanitized);

        if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(sanitized)) {
            setSelectedColor(sanitized);
        }
    };

    const handleHexBlur = () => {
        // Ensure it starts with #
        let formatted = tempHex;
        if (formatted.length > 0 && !formatted.startsWith('#')) {
            formatted = '#' + formatted;
        }

        if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(formatted)) {
            setSelectedColor(formatted);
            setTempHex(formatted);
        } else {
            // Reset to current selected color if invalid
            setTempHex(selectedColor.toUpperCase());
        }
    };

    const pickImage = async () => {
        if (localLoading) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            console.log(`[Branding] Picked image:`, result.assets[0].uri);
            setLocalImage(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        setLocalLoading(true);
        try {
            setBrandingData({
                brandingColor: selectedColor,
                logoUri: localImage,
                avatarUri: localImage
            });

            const authStore = useAuthStore.getState();
            const profileId = authStore.user?.id;

            // 1. Sync color
            console.log('[Branding] Syncing color:', selectedColor);
            await authStore.updateAiProfile({
                brandingColor: selectedColor,
            });

            // 2. Upload image if changed
            if (localImage && (localImage !== initialImage)) {
                console.log('[Branding] Uploading image (avatar & logo):', localImage);
                // We upload to both since they are the same
                await Promise.all([
                    authStore.uploadAvatar(localImage),
                    profileId ? authStore.uploadLogo(profileId, localImage) : Promise.resolve()
                ]);
            }

            await authStore.finishOnboarding();
            router.push('/(drawer)');
        } catch (e) {
            console.error('Failed to sync branding data', e);
        } finally {
            setLocalLoading(false);
        }
    };

    const onColorChange = ({ hex }: { hex: string }) => {
        'worklet';
        runOnJS(setSelectedColor)(hex);
        runOnJS(setTempHex)(hex.toUpperCase());
    };

    return (
        <BackgroundGradientOnboarding darkOverlay={true}>
            {/* StepIndicator removed as this is now the final onboarding step */}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <Animated.View entering={FadeInRight.duration(800)} style={styles.content}>
                        <Text style={styles.title}>Votre identité visuelle</Text>
                        <Text style={styles.subtitle}>
                            Personnalisez l'apparence de votre espace.
                        </Text>

                        {/* Color Picker */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Palette size={16} color={colors.text.secondary} />
                                <Text style={styles.sectionTitleText}>Couleur principale</Text>
                            </View>

                            <View style={styles.pickerWrapper}>
                                <ColorPicker
                                    value={selectedColor}
                                    onChange={onColorChange}
                                    style={styles.colorPicker}
                                >
                                    <View style={styles.panelContainer}>
                                        <Panel1 style={styles.panel} />
                                    </View>

                                    <View style={styles.slidersContainer}>
                                        <HueSlider style={styles.slider} />
                                        <OpacitySlider style={styles.slider} />
                                    </View>

                                    <View style={styles.pickerFooter}>
                                        <Preview style={styles.preview} hideText />
                                        <TextInput
                                            style={styles.hexInput}
                                            value={tempHex}
                                            onChangeText={handleHexChange}
                                            onBlur={handleHexBlur}
                                            placeholder="#000000FF"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            maxLength={9}
                                            autoCapitalize="characters"
                                            spellCheck={false}
                                            autoCorrect={false}
                                        />
                                    </View>
                                </ColorPicker>
                                {localLoading && (
                                    <View style={{
                                        ...StyleSheet.absoluteFillObject,
                                        backgroundColor: 'transparent',
                                        zIndex: 100
                                    }} />
                                )}
                            </View>
                        </View>

                        {/* Avatar / Logo */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <User size={16} color={colors.text.secondary} />
                                <Text style={styles.sectionTitleText}>Photo de profil / Logo</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.uploadBox, localLoading && { opacity: 0.6 }]}
                                onPress={() => !localLoading && pickImage()}
                                disabled={localLoading}
                            >
                                {localImage && localImage.trim() !== '' ? (
                                    <Image source={{ uri: localImage }} style={styles.uploadedImage} />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Upload size={24} color={colors.text.secondary} />
                                        <Text style={styles.uploadText}>Choisir une image</Text>
                                        <Text style={styles.uploadHint}>PNG, JPG, JPEG • Max 5Mo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                    <NeonButton
                        title="Continuer"
                        onPress={handleNext}
                        size="lg"
                        variant="premium"
                        loading={localLoading}
                        disabled={localLoading}
                        style={styles.button}
                    />
                </Animated.View>
            </View>
        </BackgroundGradientOnboarding>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingTop: 100,
        paddingBottom: 120
    },
    content: {
        gap: 24
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
    },
    section: {
        gap: 12
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    sectionTitleText: {
        color: colors.text.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
    pickerWrapper: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    colorPicker: {
        gap: 16,
    },
    panelContainer: {
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
    },
    panel: {
        flex: 1,
    },
    slidersContainer: {
        gap: 12,
    },
    slider: {
        height: 20,
        borderRadius: 10,
    },
    pickerFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingTop: 4,
    },
    preview: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    hexInput: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 100,
        textAlign: 'center',
    },
    uploadBox: {
        height: 120,
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center'
    },
    uploadPlaceholder: {
        alignItems: 'center',
        zIndex: 99999,
        gap: 8
    },
    uploadText: {
        color: colors.text.primary,
        fontSize: 14,
        fontWeight: '600'
    },
    uploadHint: {
        color: colors.text.secondary,
        fontSize: 12,
        marginTop: 2
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        zIndex: 10
    },
    button: {
        width: '100%'
    }
});
