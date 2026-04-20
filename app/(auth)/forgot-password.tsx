import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, Text, TextInput,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import Animated, { FadeInDown, useSharedValue } from 'react-native-reanimated';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';

const EmailField = React.memo(({ value, onChange, onSubmit }: { value: string; onChange: (t: string) => void; onSubmit: () => void }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.inputContainer}>
      <Text style={s.label}>Email</Text>
      <NeonBorderInput isActive={focused}>
        <TextInput
          style={[s.input, focused && s.inputActive]}
          placeholder="votre@email.com"
          placeholderTextColor="#6b7280"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </NeonBorderInput>
    </View>
  );
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const { forgotPassword } = useAuthStore();

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const handleResetPassword = async () => {
    if (!email) {
      showModal('warning', 'Email manquant', 'Veuillez entrer votre adresse email pour continuer.');
      return;
    }
    setIsLoading(true);
    showModal('loading', 'Envoi en cours...', 'Veuillez patienter');
    try {
      await forgotPassword(email);
      setIsLoading(false);
      showModal('success', 'Code envoyé !', 'Un code de réinitialisation vous a été envoyé par email.');
      setTimeout(() => {
        setModal(m => ({ ...m, visible: false }));
        router.replace({ pathname: '/(auth)/verify-otp', params: { email } });
      }, 3000);
    } catch (e: any) {
      setIsLoading(false);
      showModal('error', "Échec de l'envoi", e.message || 'Une erreur est survenue.');
    }
  };

  const scrollY = useSharedValue(0);

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <ScreenHeader titleSub="Accès" titleScript="Oublié" onBack={() => router.back()} scrollY={scrollY} />

      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={[s.scrollContent, { paddingTop: 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <Animated.View entering={FadeInDown.duration(800)} style={s.content}>

          <Text style={s.subtitle}>
            Saisissez votre adresse email. Nous vous enverrons un code pour réinitialiser de façon sécurisée votre mot de passe.
          </Text>

          <View style={s.form}>
            <EmailField value={email} onChange={setEmail} onSubmit={handleResetPassword} />
            <NeonActionButton
              label="Envoyer le code"
              onPress={handleResetPassword}
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
        onClose={() => {
          setModal(m => ({ ...m, visible: false }));
        }}
      />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 32, paddingBottom: 40, justifyContent: 'center' },
  content: { width: '100%' },
  subtitle: { fontFamily: fonts.arimo.regular, fontSize: 14, color: colors.text.secondary, marginBottom: 40, lineHeight: 24 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 32 },
  label: { fontFamily: fonts.arimo.bold, fontSize: 13, color: colors.gray, marginBottom: 8, fontWeight: '600', letterSpacing: 0.3 },
  input: { backgroundColor: colors.darkSlateBlue, borderRadius: 12, padding: 16, fontFamily: fonts.arimo.regular, color: 'white', borderWidth: 1, borderColor: '#ffffff14', zIndex: 3 },
  inputActive: { borderColor: 'transparent', backgroundColor: colors.midnightBlue },
});