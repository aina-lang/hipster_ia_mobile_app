import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, Text, TextInput,
  TouchableOpacity, TextInput as RNTextInput,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import Animated, { FadeInDown, useSharedValue } from 'react-native-reanimated';
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
import { useNetworkStore } from '../../store/networkStore';
import { neonTextGlow } from '../../theme/commonStyles';
import { loginSchema } from '../../validation/authSchemas';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [modal, setModal] = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const passwordRef = useRef<RNTextInput>(null);

  const { aiLogin, isLoading, error, clearError } = useAuthStore();
  const { setIsReturningFromBack } = useWelcomeVideoStore();

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const first = result.error.issues[0];
      showModal('warning', 'Champs invalides', first.message);
      return;
    }
    // Check connectivity before attempting login
    const isConnected = await useNetworkStore.getState().checkConnectivity();
    if (!isConnected) {
      showModal('warning', 'Pas de connexion', 'Vérifiez votre connexion internet et réessayez.');
      return;
    }
    showModal('loading', 'Connexion en cours...', 'Veuillez patienter');
    try {
      await aiLogin({ email, password });
      setModal(m => ({ ...m, visible: false }));
      useWelcomeVideoStore.getState().clearOpenedAuthFromWelcome();
      const { hasFinishedOnboarding } = useAuthStore.getState();
      router.replace(hasFinishedOnboarding ? '/(drawer)' : '/(onboarding)/setup');
    } catch (e: any) {
      setModal(m => ({ ...m, visible: false }));
      const errorMessage = e.response?.data?.message || e.message || 'Une erreur est survenue lors de la connexion.';
      showModal('error', 'Échec de la connexion', errorMessage);
      if (e.response?.data?.needsVerification) {
        setTimeout(() => {
          useWelcomeVideoStore.getState().clearOpenedAuthFromWelcome();
          router.push({ pathname: '/(auth)/verify-email', params: { email } });
        }, 500);
      }
    }
  };

  const scrollY = useSharedValue(0);

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <ScreenHeader 
        titleSub="Se" 
        titleScript="connecter" 
        onBack={() => {
          setIsReturningFromBack(true);
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/welcome');
          }
        }} 
        scrollY={scrollY}
      />

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
          <View style={s.form}>
            <Text style={s.welcomeBack}>Bon retour !</Text>

            {/* Email */}
            <View style={s.inputContainer}>
              <Text style={s.label}>Email</Text>
              <NeonBorderInput isActive={focused === 'email'}>
                <TextInput
                  style={[s.input, focused === 'email' && s.inputActive]}
                  placeholder="votre@email.com"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={t => { setEmail(t); if (error) clearError(); }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </NeonBorderInput>
            </View>

            {/* Mot de passe */}
            <View style={s.inputContainer}>
              <Text style={s.label}>Mot de passe</Text>
              <NeonBorderInput isActive={focused === 'password'}>
                <View style={s.passwordWrapper}>
                  <TextInput
                    ref={passwordRef}
                    style={[s.input, s.passwordInput, focused === 'password' && s.inputActive]}
                    placeholder="••••••••"
                    placeholderTextColor="#6b7280"
                    value={password}
                    onChangeText={t => { setPassword(t); if (error) clearError(); }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity style={s.eyeIcon} onPress={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                  </TouchableOpacity>
                </View>
              </NeonBorderInput>
            </View>

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
              <NeonLink label="S'inscrire" onPress={() => router.push('/(auth)/register')} />
            </View>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>

      <GenericModal visible={modal.visible} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal(m => ({ ...m, visible: false }))} />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  kav: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center'
  },
  content: { width: '100%' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: colors.gray,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  input: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.arimo.regular,
    color: 'white',
    borderWidth: 1,
    borderColor: '#ffffff14',
    zIndex: 3
  },
  inputActive: {
    borderColor: 'transparent',
    backgroundColor: colors.midnightBlue
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center'
  },
  passwordInput: {
    paddingRight: 50
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    zIndex: 4
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 24
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  footerText: {
    fontFamily: fonts.arimo.regular,
    color: '#9ca3af',
    fontSize: 14
  },
  welcomeBack: {
    fontFamily: fonts.brittany,
    fontSize: 38,
    textAlign: 'center',
    marginBottom: 28,
    paddingVertical: 10,
    ...neonTextGlow
  }
});