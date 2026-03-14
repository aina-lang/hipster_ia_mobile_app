import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, Animated as RNAnimated, Easing,
  Pressable, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

function NeonBorderInput({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loop = useRef<RNAnimated.CompositeAnimation | null>(null);

  useEffect(() => {
    loop.current?.stop();
    if (isActive) {
      translateX.setValue(0);
      loop.current = RNAnimated.loop(
        RNAnimated.timing(translateX, { toValue: -800, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
        { resetBeforeIteration: true }
      );
      loop.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => loop.current?.stop();
  }, [isActive]);

  return (
    <View style={nb.wrapper}>
      {isActive && (
        <>
          <View style={nb.clip} pointerEvents="none">
            <RNAnimated.View style={[nb.track, { transform: [{ translateX }] }]}>
              <LinearGradient
                colors={['transparent', '#00eaff', '#1e9bff', 'transparent', 'transparent', '#00eaff', '#1e9bff', 'transparent']}
                locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={{ width: 1600, height: '100%' }}
              />
            </RNAnimated.View>
            <View style={nb.mask} />
          </View>
          <View style={nb.bloomMid} pointerEvents="none" />
          <View style={nb.bloomFar} pointerEvents="none" />
        </>
      )}
      {children}
    </View>
  );
}

const nb = StyleSheet.create({
  wrapper:   { position: 'relative' },
  clip:      { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 13, overflow: 'hidden', zIndex: 2 },
  track:     { position: 'absolute', top: 0, bottom: 0, left: 0 },
  mask:      { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 12, zIndex: 1, backgroundColor: '#030814' },
  bloomMid:  { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: 'transparent', shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  bloomFar:  { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 20, backgroundColor: 'transparent', shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 4 },
});

function NeonLoginButton({ onPress, loading, disabled }: { onPress: () => void; loading: boolean; disabled: boolean }) {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const spring = (v: number, speed: number) => RNAnimated.spring(scale, { toValue: v, useNativeDriver: true, speed }).start();

  return (
    <RNAnimated.View style={[btn.wrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => spring(0.96, 40)} onPressOut={() => spring(1, 20)} disabled={disabled} style={btn.pressable}>
        <LinearGradient colors={['#264F8C', '#0a1628', '#040612']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.46, 1]} style={btn.gradient}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={btn.text}>Se connecter</Text>}
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

const btn = StyleSheet.create({
  wrapper:   { alignSelf: 'center', width: '60%', shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10, marginBottom: 24 },
  pressable: { borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  gradient:  { paddingVertical: 16, paddingHorizontal: 19, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  text:      { fontFamily: 'Arimo-Bold', fontSize: 15, fontWeight: '600', letterSpacing: 0.6, color: '#fff' },
});

export default function LoginScreen() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused]       = useState(false);
  const [modal, setModal]               = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const { aiLogin, isLoading, error, clearError } = useAuthStore();

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs pour continuer.');
      return;
    }
    showModal('loading', 'Connexion en cours...', 'Veuillez patienter');
    try {
      await aiLogin({ email, password });
      setModal(m => ({ ...m, visible: false }));
      const { hasFinishedOnboarding } = useAuthStore.getState();
      router.replace(hasFinishedOnboarding ? '/(drawer)' : '/(onboarding)/setup');
    } catch (e: any) {
      showModal('error', 'Échec de la connexion', e.response?.data?.message || e.message || 'Une erreur est survenue.');
      if (e.response?.data?.needsVerification) {
        setModal(m => ({ ...m, visible: false }));
        router.push({ pathname: '/(auth)/verify-email', params: { email } });
      }
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        <Animated.View entering={FadeInDown.duration(800)} style={s.content}>

          <View style={s.header}>
            <View style={s.titleRow}>
              <Text style={s.titleSub}>Bon</Text>
              <Text style={s.titleScript}>retour !</Text>
            </View>
            <Text style={s.subtitle}>Connectez-vous pour continuer l'expérience IA.</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputContainer}>
              <Text style={s.label}>Email</Text>
              <NeonBorderInput isActive={emailFocused}>
                <TextInput
                  style={[s.input, emailFocused && s.inputActive]}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={t => { setEmail(t); if (error) clearError(); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </NeonBorderInput>
            </View>

            <View style={s.inputContainer}>
              <Text style={s.label}>Mot de passe</Text>
              <NeonBorderInput isActive={pwFocused}>
                <View style={s.passwordWrapper}>
                  <TextInput
                    style={[s.input, s.passwordInput, pwFocused && s.inputActive]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                    value={password}
                    onChangeText={t => { setPassword(t); if (error) clearError(); }}
                    onFocus={() => setPwFocused(true)}
                    onBlur={() => setPwFocused(false)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={s.eyeIcon} onPress={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={20} color={colors.text.muted} /> : <Eye size={20} color={colors.text.muted} />}
                  </TouchableOpacity>
                </View>
              </NeonBorderInput>
            </View>

            <TouchableOpacity style={s.forgotPassword} onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={s.neonLink}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <NeonLoginButton onPress={handleLogin} loading={isLoading} disabled={isLoading} />

            <View style={s.footer}>
              <Text style={s.footerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(onboarding)/packs')}>
                <Text style={s.neonLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <GenericModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(m => ({ ...m, visible: false }))}
        />
      </KeyboardAvoidingView>
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 24 },
  content:         { flex: 1, paddingTop: 60 },

  header:          { alignItems: 'flex-start', marginBottom: 36, paddingHorizontal: 8 },
  titleRow:        { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  titleSub:        { fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' },
  titleScript:     { fontFamily: 'Brittany-Signature', fontSize: 42, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18, lineHeight: 48, includeFontPadding: false },
  subtitle:        { fontFamily: 'Arimo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'left', letterSpacing: 0.3, marginTop: 4 },

  form:            { width: '100%' },
  inputContainer:  { marginBottom: 20 },
  label:           { fontFamily: 'Arimo-Bold', fontSize: 13, color: colors.text.secondary, marginBottom: 8, fontWeight: '600', letterSpacing: 0.3 },
  input:           { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12, padding: 16, fontFamily: 'Arimo-Regular', color: colors.text.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 3 },
  inputActive:     { borderColor: 'transparent', backgroundColor: '#030814' },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput:   { paddingRight: 50 },
  eyeIcon:         { position: 'absolute', right: 16, height: '100%', justifyContent: 'center', zIndex: 4 },

  forgotPassword:  { alignSelf: 'flex-end', marginBottom: 24 },
  neonLink:        { fontFamily: 'Arimo-Regular', fontSize: 14, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },

  footer:          { flexDirection: 'row', justifyContent: 'center' },
  footerText:      { fontFamily: 'Arimo-Regular', color: colors.text.secondary, fontSize: 14 },
});