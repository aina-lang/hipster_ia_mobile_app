import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView, Pressable, ActivityIndicator,
  Animated as RNAnimated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
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
  wrapper:  { position: 'relative' },
  clip:     { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 13, overflow: 'hidden', zIndex: 2 },
  track:    { position: 'absolute', top: 0, bottom: 0, left: 0 },
  mask:     { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 12, zIndex: 1, backgroundColor: '#030814' },
  bloomMid: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: 'transparent', shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  bloomFar: { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 20, backgroundColor: 'transparent', shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 4 },
});

function NeonResetButton({ onPress, loading, disabled }: { onPress: () => void; loading: boolean; disabled: boolean }) {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const spring = (v: number, speed: number) => RNAnimated.spring(scale, { toValue: v, useNativeDriver: true, speed }).start();

  return (
    <RNAnimated.View style={[btn.wrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => spring(0.96, 40)} onPressOut={() => spring(1, 20)} disabled={disabled} style={btn.pressable}>
        <LinearGradient colors={['#264F8C', '#0a1628', '#040612']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.46, 1]} style={btn.gradient}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={btn.text}>Envoyer le code</Text>}
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

const btn = StyleSheet.create({
  wrapper:   { alignSelf: 'felx-start', width: '60%', marginBottom: 24 },
  pressable: { borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  gradient:  { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  text:      { fontFamily: 'Arimo-Bold', fontSize: 14, fontWeight: '600', letterSpacing: 0.6, color: '#fff' },
});

const EmailField = React.memo(({ value, onChange }: { value: string; onChange: (t: string) => void }) => {
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
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </NeonBorderInput>
    </View>
  );
});

export default function ForgotPasswordScreen() {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal]       = useState({ visible: false, type: 'info' as any, title: '', message: '' });

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

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableOpacity
            style={s.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.duration(800)} style={s.content}>
            <Text style={s.title}>Mot de passe oublié</Text>
            <Text style={s.subtitle}>
              Saisissez votre adresse email. Nous vous enverrons un code pour réinitialiser de façon sécurisée votre mot de passe.
            </Text>

            <View style={s.form}>
              <EmailField value={email} onChange={setEmail} />
              <NeonResetButton onPress={handleResetPassword} loading={isLoading} disabled={isLoading} />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GenericModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => {
          setModal(m => ({ ...m, visible: false }));
          if (modal.type === 'success') router.replace('/(auth)/login');
        }}
      />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  scrollContent:  { flexGrow: 1, paddingHorizontal: 32, paddingBottom: 40 },
  backButton:     { marginTop: 60, marginBottom: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  content:        { flex: 1, paddingTop: 20 },
  title:          { fontFamily: 'Arimo-Bold', fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },
  subtitle:       { fontFamily: 'Arimo-Regular', fontSize: 14, color: colors.text.secondary, marginBottom: 40, lineHeight: 24 },
  form:           { width: '100%' },
  inputContainer: { marginBottom: 32 },
  label:          { fontFamily: 'Arimo-Bold', fontSize: 13, color: colors.text.secondary, marginBottom: 8, fontWeight: '600', letterSpacing: 0.3 },
  input:          { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12, padding: 16, fontFamily: 'Arimo-Regular', color: colors.text.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 3 },
  inputActive:    { borderColor: 'transparent', backgroundColor: '#030814' },
});