import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
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
// import { runOnJS, scheduleOnRN } from 'react-native-worklets'; // Removed as runOnJS from Reanimated is preferred for this use case

export default function BrandingScreen() {
    const router = useRouter();
    const {
        brandingColor, setBrandingData,
        logoUri, avatarUri, profileType
    } = useOnboardingStore();

    const [selectedColor, setSelectedColor] = useState(brandingColor || '#FF0000');
    const [localLogo, setLocalLogo] = useState(logoUri);
    const [localAvatar, setLocalAvatar] = useState(avatarUri);

    const pickImage = async (type: 'logo' | 'avatar') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Besoin de la permission pour accéder à la galerie.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            if (type === 'logo') setLocalLogo(result.assets[0].uri);
            else setLocalAvatar(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        setBrandingData({
            brandingColor: selectedColor,
            logoUri: localLogo,
            avatarUri: localAvatar
        });
        router.push('/(auth)/register');
    };

    const onColorChange = ({ hex }: { hex: string }) => {
        'worklet';
        runOnJS(setSelectedColor)(hex);
    };

    return (
        <BackgroundGradientOnboarding blurIntensity={90}>
            <StepIndicator currentStep={2} totalSteps={3} />

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
                                    onComplete={onColorChange}
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
                                        <Text style={styles.hexText}>{selectedColor.toUpperCase()}</Text>
                                    </View>
                                </ColorPicker>
                            </View>
                        </View>

                        {/* Avatar */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <User size={16} color={colors.text.secondary} />
                                <Text style={styles.sectionTitleText}>Votre Avatar</Text>
                            </View>
                            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('avatar')}>
                                {localAvatar ? (
                                    <Image source={{ uri: localAvatar }} style={styles.uploadedImage} />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Upload size={24} color={colors.text.muted} />
                                        <Text style={styles.uploadText}>Choisir une photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Logo */}
                        {profileType === 'entreprise' && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Upload size={16} color={colors.text.secondary} />
                                    <Text style={styles.sectionTitleText}>Logo de l'entreprise</Text>
                                </View>
                                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('logo')}>
                                    {localLogo ? (
                                        <Image source={{ uri: localLogo }} style={styles.uploadedImage} />
                                    ) : (
                                        <View style={styles.uploadPlaceholder}>
                                            <Upload size={24} color={colors.text.muted} />
                                            <Text style={styles.uploadText}>Choisir un logo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

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
        paddingBottom: 120
    },
    content: {
        paddingTop: 20,
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
    hexText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
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
        gap: 8
    },
    uploadText: {
        color: colors.text.muted,
        fontSize: 14
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
