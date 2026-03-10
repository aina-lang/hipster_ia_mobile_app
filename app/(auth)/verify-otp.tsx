import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<any>('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const { verifyResetCode } = useAuthStore();

    const showModal = (type: any, title: string, message: string = '') => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const handleVerifyCode = async () => {
        Keyboard.dismiss();

        if (!code) {
            showModal('warning', 'Code manquant', 'Veuillez entrer le code de vérification.');
            return;
        }

        setIsLoading(true);
        showModal('loading', 'Vérification...', 'Veuillez patienter');

        try {
            await verifyResetCode(email as string, code);

            setIsLoading(false);
            setModalVisible(false);

            // Navigate to reset password with email and code
            router.replace({ pathname: '/(auth)/reset-password', params: { email, code } });

        } catch (e: any) {
            setIsLoading(false);
            showModal('error', 'Échec de la vérification', e.message || 'Le code est invalide ou expiré.');
        }
    };

    return (
        <BackgroundGradientOnboarding darkOverlay={true}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.innerContainer}>

                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.replace('/(auth)/forgot-password')}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </TouchableOpacity>

                        <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                            <Text style={styles.title}>Vérification OTP</Text>
                            <Text style={styles.subtitle}>Un code a été envoyé à {email}. Veuillez l'entrer ci-dessous pour continuer.</Text>

                            <View style={styles.form}>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Code de vérification</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123456"
                                        placeholderTextColor={colors.text.muted}
                                        value={code}
                                        onChangeText={setCode}
                                        autoCapitalize="none"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>

                                <NeonButton
                                    title="Vérifier le code"
                                    onPress={handleVerifyCode}
                                    size="lg"
                                    variant="premium"
                                    loading={isLoading}
                                    disabled={isLoading}
                                    style={styles.submitButton}
                                />
                            </View>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>

                <GenericModal
                    visible={modalVisible}
                    type={modalType}
                    title={modalTitle}
                    message={modalMessage}
                    onClose={() => setModalVisible(false)}
                />
            </KeyboardAvoidingView>
        </BackgroundGradientOnboarding>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 32,
    },
    backButton: {
        marginTop: 60,
        marginBottom: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flex: 1,
        paddingTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: colors.text.secondary,
        marginBottom: 30,
        lineHeight: 22,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderRadius: 12,
        padding: 16,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        fontSize: 16,
    },
    submitButton: {
        width: '100%',
        marginTop: 12,
    },
});
