import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    NativeSyntheticEvent,
    TextInputKeyPressEventData
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

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

    const handleChange = (text: string, index: number) => {
        // Handle paste: if text length > 1, distribute across cells
        if (text.length > 1) {
            const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
            const newOtp = [...otp];
            for (let i = 0; i < digits.length; i++) {
                newOtp[index + i] = digits[i];
                if (index + i >= OTP_LENGTH - 1) break;
            }
            setOtp(newOtp);
            const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const digit = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-focus next input
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerifyCode = async () => {
        Keyboard.dismiss();

        const code = otp.join('');

        if (code.length < OTP_LENGTH) {
            showModal('warning', 'Code incomplet', 'Veuillez entrer les 6 chiffres du code de vérification.');
            return;
        }

        setIsLoading(true);
        showModal('loading', 'Vérification...', 'Veuillez patienter');

        try {
            await verifyResetCode(email as string, code);

            setIsLoading(false);
            setModalVisible(false);

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

                        <View style={styles.fixedHeader}>
                            <NeonBackButton onPress={() => router.back()} />
                            <View style={styles.headerCenter}>
                                <View style={styles.titleRow}>
                                <Text style={styles.titleSub}>Vérification</Text>
                                <Text style={styles.titleScript}>OTP</Text>
                                </View>
                            </View>
                        </View>

                        <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                            <Text style={styles.subtitle}>
                                Un code a été envoyé à {email}. Veuillez l'entrer ci-dessous pour continuer.
                            </Text>

                            <View style={styles.form}>

                                {/* OTP Input Boxes */}
                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={[
                                                styles.otpInput,
                                                digit ? styles.otpInputFilled : null,
                                            ]}
                                            value={digit}
                                            onChangeText={(text) => handleChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                            caretHidden={true}
                                            textAlign="center"
                                            placeholderTextColor={colors.text.muted}
                                            placeholder="•"
                                        />
                                    ))}
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
        flex: 1
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
        paddingHorizontal: 32,
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
        marginBottom: 36,
        lineHeight: 22,
    },
    form: {
        width: '100%',
    },
   otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    otpInput: {
        width: 44,
        height: 48,
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        color: colors.text.primary,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    otpInputFilled: {
        borderColor: 'rgba(255, 255, 255, 0.45)',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
    },
    submitButton: {
        width: '100%',
        marginTop: 4,
    },
    fixedHeader:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 8, backgroundColor: 'rgba(10,15,30,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 100 },
    headerCenter: { flex: 1, alignItems: 'center' },
    titleRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
    titleSub:     { fontFamily: 'Arimo-Bold', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', lineHeight: 22 },
    titleScript:  { fontFamily: 'Brittany-Signature', fontSize: 28, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18, lineHeight: 22, includeFontPadding: false },
});