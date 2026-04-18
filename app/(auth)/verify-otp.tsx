import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, Text, TextInput,
  Platform, Keyboard,
  NativeSyntheticEvent, TextInputKeyPressEventData,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';

const NEON_BLUE  = colors.neonBlue;
const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { email }                 = useLocalSearchParams();
  const [otp, setOtp]             = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal]         = useState({ visible: false, type: 'info' as any, title: '', message: '' });
  const inputRefs                 = useRef<(TextInput | null)[]>([]);
  const { verifyResetCode }       = useAuthStore();

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[index + i] = digits[i];
        if (index + i >= OTP_LENGTH - 1) break;
      }
      setOtp(newOtp);
      const next = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[next]?.focus();
      return;
    }
    const digit  = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
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
      setModal(m => ({ ...m, visible: false }));
      router.replace({ pathname: '/(auth)/reset-password', params: { email, code } });
    } catch (e: any) {
      setIsLoading(false);
      showModal('error', 'Échec de la vérification', e.message || 'Le code est invalide ou expiré.');
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <ScreenHeader titleSub="Vérification" titleScript="OTP" onBack={() => router.back()} />

      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)}>
          <Text style={s.subtitle}>
            Un code a été envoyé à <Text style={s.emailText}>{email}</Text>.{'\n'}
            Veuillez l'entrer ci-dessous pour continuer.
          </Text>

          <View style={s.form}>
            <View style={s.otpContainer}>
              {otp.map((digit, index) => (
                <NeonBorderInput key={index} isActive={focusedIndex === index}>
                  <TextInput
                    ref={ref => { inputRefs.current[index] = ref; }}
                    style={[s.otpInput, (digit || focusedIndex === index) ? s.otpInputActive : null]}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    caretHidden
                    textAlign="center"
                    placeholderTextColor={colors.text.muted}
                    placeholder="•"
                  />
                </NeonBorderInput>
              ))}
            </View>

            <NeonActionButton
              label="Vérifier le code"
              onPress={handleVerifyCode}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>

      <GenericModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(m => ({ ...m, visible: false }))}
      />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: fonts.arimo.regular,
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 36,
    lineHeight: 22,
  },
  emailText: {
    fontFamily: fonts.arimo.bold,
    color: NEON_BLUE,
  },
  form:         { width: '100%' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 8 },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff26',
    color: 'white',
    fontFamily: fonts.arimo.bold,
    fontSize: 20,
    textAlign: 'center',
    zIndex: 3,
  },
  otpInputActive: {
    borderColor: 'transparent',
    backgroundColor: colors.midnightBlue
  },
});