import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, Animated as RNAnimated, Easing,
  Pressable, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

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
  wrapper:  { position: 'relative' },
  clip:     { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 13, overflow: 'hidden', zIndex: 2 },
  track:    { position: 'absolute', top: 0, bottom: 0, left: 0 },
  mask:     { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 12, zIndex: 1, backgroundColor: '#030814' },
  bloomMid: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: 'transparent', shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  bloomFar: { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 20, backgroundColor: 'transparent', shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 4 },
});

function NeonLoginButton({ onPress, loading, disabled }: { onPress: () => void; loading: boolean; disabled: boolean }) {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const spring = (v: number, speed: number) => RNAnimated.spring(scale, { toValue: v, useNativeDriver: true, speed }).start();

  return (
    <RNAnimated.View style={[btn.wrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => spring(0.96, 40)} onPressOut={() => spring(1, 20)} disabled={disabled} style={btn.pressable}>
        <LinearGradient colors={['#1e6ba8', '#0a3d7a', '#051a3d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.5, 1]} style={btn.gradient}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={btn.text}>Se connecter</Text>}
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

const btn = StyleSheet.create({
  wrapper:   { alignSelf: 'center', width: '100%', marginBottom: 0, marginTop: 16 },
  pressable: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  gradient:  { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  text:      { fontFamily: 'Arimo-Bold', fontSize: 15, fontWeight: '600', letterSpacing: 0.5, color: '#fff' },
});

const EmailField = React.memo(({ value, onChange, onClear }: {
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.inputContainer}>
      <Text style={s.label}>Email</Text>
      <NeonBorderInput isActive={focused}>
        <TextInput
          style={[s.input, focused && s.inputActive]}
          placeholder="votre@email.com"
          placeholderTextColor={colors.text.muted}
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
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
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
            placeholderTextColor={colors.text.muted}
            value={value}
            onChangeText={t => { onChange(t); onClear(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={!show}
          />
          <TouchableOpacity style={s.eyeIcon} onPress={() => setShow(v => !v)}>
            {show ? <EyeOff size={20} color={colors.text.muted} /> : <Eye size={20} color={colors.text.muted} />}
          </TouchableOpacity>
        </View>
      </NeonBorderInput>
    </View>
  );
});

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal]       = useState({ visible: false, type: 'info' as any, title: '', message: '' });

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
      await aiLogin({ email, password });
      setModal(m => ({ ...m, visible: false }));
      
      // Get the updated state after login
      const state = useAuthStore.getState();
      const destination = state.hasFinishedOnboarding ? '/(drawer)' : '/(onboarding)/job';
      
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        router.replace(destination);
      }, 300);
    } catch (e: any) {
      console.error('[LoginScreen] Login error:', e);
      const errorMessage = e.response?.data?.message || e.message || 'Une erreur est survenue lors de la connexion.';
      
      if (e.response?.data?.needsVerification) {
        setModal(m => ({ ...m, visible: false }));
        setTimeout(() => {
          router.push({ pathname: '/(auth)/verify-email', params: { email } });
        }, 300);
      } else {
        showModal('error', 'Échec de la connexion', errorMessage);
      }
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.kav}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── FIXED HEADER ── */}
        <View style={s.fixedHeader}>
          <NeonBackButton onPress={() => router.back()} />
          <View style={s.headerCenter}>
            <View style={s.titleRow}>
              <Text style={s.titleSub}>Se</Text>
              <Text style={s.titleScript}>connecter</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View entering={FadeInDown.duration(800)} style={s.content}>

            {/* ── HEADER SECTION ── */}
            <View style={s.header}>
              <View style={s.titleRow}>
                <Text style={s.titleSub}>bon</Text>
                <Text style={s.titleScript}>retour !</Text>
              </View>
              <Text style={s.subtitle}>Connectez-vous pour continuer l'expérience IA.</Text>
            </View>

            {/* ── FORM SECTION ── */}
            <View style={s.form}>
              <EmailField
                value={email}
                onChange={setEmail}
                onClear={() => { if (error) clearError(); }}
              />
              <PasswordField
                value={password}
                onChange={setPassword}
                onClear={() => { if (error) clearError(); }}
              />

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
        </ScrollView>
      </KeyboardAvoidingView>

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
  kav:             { flex: 1 },
  fixedHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: 'rgba(10,15,30,0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 100 },
  backButtonStyle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerCenter:    { flex: 1, alignItems: 'center' },
  scrollContent:   { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 60, justifyContent: 'center' },
  content:         { width: '100%' },

  header:          { alignItems: 'center', marginBottom: 48, paddingHorizontal: 8 },
  titleRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 },
  titleSub:        { fontFamily: 'Arimo-Bold', fontSize: 18, letterSpacing: 2, textTransform: 'lowercase', color: 'rgba(255,255,255,0.6)' },
  titleScript:     { fontFamily: 'Brittany-Signature', fontSize: 32, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16, includeFontPadding: false },
  subtitle:        { fontFamily: 'Arimo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', letterSpacing: 0.3 },

  form:            { width: '100%' },
  inputContainer:  { marginBottom: 24 },
  label:           { fontFamily: 'Arimo-Bold', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontWeight: '600', letterSpacing: 0.3 },
  input:           { backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 10, padding: 16, fontFamily: 'Arimo-Regular', color: colors.text.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 3 },
  inputActive:     { borderColor: 'rgba(0, 234, 255, 0.3)', backgroundColor: 'rgba(15,23,42,0.8)' },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput:   { paddingRight: 50 },
  eyeIcon:         { position: 'absolute', right: 16, height: '100%', justifyContent: 'center', zIndex: 4 },

  forgotPassword:  { alignSelf: 'flex-end', marginBottom: 32 },
  neonLink:        { fontFamily: 'Arimo-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecorationLine: 'underline' },

  footer:          { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 28 },
  footerText:      { fontFamily: 'Arimo-Regular', color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});