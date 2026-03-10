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
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<any>('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const { forgotPassword } = useAuthStore();

    const showModal = (type: any, title: string, message: string = '') => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const handleResetPassword = async () => {
        Keyboard.dismiss();

        if (!email) {
            showModal('warning', 'Email manquant', 'Veuillez entrer votre adresse email pour continuer.');
            return;
        }

        setIsLoading(true);
        showModal('loading', 'Envoi en cours...', 'Veuillez patienter');

        try {
            await forgotPassword(email);

            setIsLoading(false);
            showModal(
                'success',
                'Code envoyé !',
                'Un code de réinitialisation vous a été envoyé par email.'
            );

            // Navigate to verify otp screen with the email
            setTimeout(() => {
                setModalVisible(false);
                router.replace({ pathname: '/(auth)/verify-otp', params: { email } });
            }, 3000);

        } catch (e: any) {
            setIsLoading(false);
            showModal('error', 'Échec de l\'envoi', e.message || 'Une erreur est survenue.');
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
                            onPress={() => router.back()}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </TouchableOpacity>

                        <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                            <Text style={styles.title}>Mot de passe oublié</Text>
                            <Text style={styles.subtitle}>Saisissez votre adresse email. Nous vous enverrons un code pour réinitialiser de façon sécurisée votre mot de passe.</Text>

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="votre@email.com"
                                        placeholderTextColor={colors.text.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                    />
                                </View>

                                <NeonButton
                                    title="Envoyer le code"
                                    onPress={handleResetPassword}
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
                    onClose={() => {
                        setModalVisible(false);
                        if (modalType === 'success') {
                            router.replace('/(auth)/login');
                        }
                    }}
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
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        marginBottom: 40,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 10,
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
    },
});
