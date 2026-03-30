import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonLink } from '../../components/ui/NeonLink';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';

const EmailField = React.memo(({ value, onChange, onClear }: {
  value: string; onChange: (t: string) => void; onClear: () => void;
}) => {
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
          onChangeText={t => { onChange(t); onClear(); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </NeonBorderInput>
    </View>
  );
});

const PasswordField = React.memo(({ value, onChange, onClear }: {
  value: string; onChange: (t: string) => void; onClear: () => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View style={s.inputContainer}>
      <Text style={s.label}>Mot de passe</Text>
      <NeonBorderInput isActive={focused}>
        <View style={s.passwordWrapper}>
          <TextInput
            style={[s.input, s.passwordInput, focused && s.inputActive]}
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            value={value}
            onChangeText={t => { onChange(t); onClear(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={!show}
          />
          <TouchableOpacity style={s.eyeIcon} onPress={() => setShow(v => !v)}>
            {show ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>
      </NeonBorderInput>
    </View>
  );
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const { aiLogin, isLoading, error, clearError } = useAuthStore();
  const { setIsReturningFromBack } = useWelcomeVideoStore();

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs pour continuer.');
      return;
    }
    showModal('loading', 'Connexion en cours...', 'Veuillez patienter');
    try {
      console.log('[Login] Starting login...');
      await aiLogin({ email, password });
      console.log('[Login] aiLogin completed successfully');
      setModal(m => ({ ...m, visible: false }));
      useWelcomeVideoStore.getState().clearOpenedAuthFromWelcome();
      const { hasFinishedOnboarding, isAuthenticated } = useAuthStore.getState();
      console.log('[Login] Current auth state:', { hasFinishedOnboarding, isAuthenticated });
      router.replace(hasFinishedOnboarding ? '/(drawer)' : '/(onboarding)/setup');
    } catch (e: any) {
      console.error('[Login] Login error:', e);
      // Always close loading modal on error
      setModal(m => ({ ...m, visible: false }));
      
      const errorMessage = e.response?.data?.message || e.message || 'Une erreur est survenue lors de la connexion.';
      console.log('[Login] Showing error modal:', errorMessage);
      showModal('error', 'Échec de la connexion', errorMessage);
      
      if (e.response?.data?.needsVerification) {
        console.log('[Login] Email verification needed');
        setTimeout(() => {
          useWelcomeVideoStore.getState().clearOpenedAuthFromWelcome();
          router.push({ pathname: '/(auth)/verify-email', params: { email } });
        }, 500);
      }
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>

        <ScreenHeader titleSub="Se" titleScript="connecter" onBack={() => {
          setIsReturningFromBack(true);
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/welcome');
          }
        }} />

        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <Animated.View entering={FadeInDown.duration(800)} style={s.content}>
            <View style={s.form}>

              <EmailField value={email} onChange={setEmail} onClear={() => { if (error) clearError(); }} />
              <PasswordField value={password} onChange={setPassword} onClear={() => { if (error) clearError(); }} />

              <NeonLink
                label="Mot de passe oublié ?"
                onPress={() => router.push('/(auth)/forgot-password')}
                style={s.forgotPassword}
              />

              <NeonActionButton
                label="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
              />

              <View style={s.footer}>
                <Text style={s.footerText}>Pas encore de compte ? </Text>
                <NeonLink label="S'inscrire" onPress={() => router.push('/(onboarding)/packs')} />
              </View>

            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GenericModal visible={modal.visible} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal(m => ({ ...m, visible: false }))} />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  kav: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, justifyContent: 'center' },
  content: { width: '100%' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: colors.gray,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.arimo.regular,
    color: 'white',
    borderWidth: 1,
    borderColor: '#ffffff14',
    zIndex: 3,
  },
  inputActive: { borderColor: 'transparent', backgroundColor: colors.midnightBlue },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 50 },
  eyeIcon: { position: 'absolute', right: 16, height: '100%', justifyContent: 'center', zIndex: 4 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { fontFamily: fonts.arimo.regular, color: '#9ca3af', fontSize: 14 },
});