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
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export default function ResetPasswordScreen() {
    const { email, code } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<any>('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const { resetPassword } = useAuthStore();

    const showModal = (type: any, title: string, message: string = '') => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const handleResetPassword = async () => {
        Keyboard.dismiss();

        if (!newPassword || !confirmPassword) {
            showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs pour réinitialiser le mot de passe.');
            return;
        }

        if (newPassword.length < 8) {
            showModal('warning', 'Mot de passe trop court', 'Le nouveau mot de passe doit faire au moins 8 caractères.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showModal('warning', 'Mots de passe différents', 'Les deux mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        showModal('loading', 'Réinitialisation...', 'Veuillez patienter');

        try {
            await resetPassword(email as string, code as string, newPassword);

            setIsLoading(false);
            showModal(
                'success',
                'Succès',
                'Votre mot de passe a été réinitialisé avec succès.'
            );

            // Navigate back to login
            setTimeout(() => {
                setModalVisible(false);
                router.replace('/(auth)/login');
            }, 3000);

        } catch (e: any) {
            setIsLoading(false);
            showModal('error', 'Échec de la réinitialisation', e.message || 'Une erreur est survenue.');
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
                            onPress={() => router.replace('/(auth)/login')}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </TouchableOpacity>

                        <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                            <Text style={styles.title}>Nouveau mot de passe</Text>
                            <Text style={styles.subtitle}>Entrez le code reçu par email ainsi que votre nouveau mot de passe.</Text>

                            <View style={styles.form}>



                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Nouveau mot de passe</Text>
                                    <View style={styles.passwordWrapper}>
                                        <TextInput
                                            style={[styles.input, styles.passwordInput]}
                                            placeholder="••••••••"
                                            placeholderTextColor={colors.text.muted}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff size={20} color={colors.text.muted} />
                                            ) : (
                                                <Eye size={20} color={colors.text.muted} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Confirmer le mot de passe</Text>
                                    <View style={styles.passwordWrapper}>
                                        <TextInput
                                            style={[styles.input, styles.passwordInput]}
                                            placeholder="••••••••"
                                            placeholderTextColor={colors.text.muted}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} color={colors.text.muted} />
                                            ) : (
                                                <Eye size={20} color={colors.text.muted} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <NeonButton
                                    title="Réinitialiser"
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
    passwordWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        height: '100%',
        justifyContent: 'center',
        zIndex: 1,
    },
    submitButton: {
        width: '100%',
        marginTop: 12,
    },
});
