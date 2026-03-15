import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView, Animated as RNAnimated,
  Easing, Pressable, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';

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

function NeonSubmitButton({ onPress, loading, disabled }: { onPress: () => void; loading: boolean; disabled: boolean }) {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const spring = (v: number, speed: number) => RNAnimated.spring(scale, { toValue: v, useNativeDriver: true, speed }).start();

  return (
    <RNAnimated.View style={[btn.wrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => spring(0.96, 40)} onPressOut={() => spring(1, 20)} disabled={disabled} style={btn.pressable}>
        <LinearGradient colors={['#264F8C', '#0a1628', '#040612']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.46, 1]} style={btn.gradient}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={btn.text}>S'inscrire</Text>}
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

const btn = StyleSheet.create({
  wrapper:   { alignSelf: 'center', width: '60%', shadowColor: '#1e9bff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10, marginBottom: 16 },
  pressable: { borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  gradient:  { paddingVertical: 16, paddingHorizontal: 19, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  text:      { fontFamily: 'Arimo-Bold', fontSize: 15, fontWeight: '600', letterSpacing: 0.6, color: '#fff' },
});

export default function RegisterScreen() {
  const { selectedPlan } = useOnboardingStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { aiRegister, error, clearError } = useAuthStore();
  const [showConfirm, setShowConfirm]         = useState(false);
  const [focused, setFocused]                 = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [modal, setModal]                     = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }

    if (!acceptedTerms) {
      showModal('warning', 'Conditions non acceptées', 'Vous devez accepter les conditions d\'utilisation pour continuer.');
      return;
    }
    if (password !== confirmPassword) {
      showModal('error', 'Erreur de mot de passe', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    showModal('loading', 'Création du compte...', 'Veuillez patienter');
    try {
      const { brandingColor, job } = useOnboardingStore.getState();
      const response = await aiRegister({
        name: fullName, email, password,
        planId: selectedPlan || 'curieux',
        brandingColor, job,
        referralCode: referralCode.trim() || undefined,
      });
      const res = response?.data ?? response;
      showModal('success', 'Compte créé !', 'Vérifiez votre email pour activer votre compte.');
      setTimeout(() => {
        setModal(m => ({ ...m, visible: false }));
        router.push({ pathname: '/(auth)/verify-email', params: { email, userId: res.userId, planId: selectedPlan } });
      }, 1500);
    } catch (e: any) {
      setLoading(false);
      showModal('error', "Échec de l'inscription", e.response?.data?.message || e.message || 'Une erreur est survenue.');
    }
  };

  const f = (name: string) => ({ onFocus: () => setFocused(name), onBlur: () => setFocused(null) });

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(800)}>

            <View style={s.header}>
              <View style={s.titleRow}>
                <Text style={s.titleSub}>Créer un</Text>
                <Text style={s.titleScript}>compte</Text>
              </View>
              <Text style={s.subtitle}>Finalisez votre inscription pour accéder à Hipster IA.</Text>
            </View>

            <View style={s.form}>
              <View style={s.inputContainer}>
                <Text style={s.label}>Nom / Nom d'entreprise</Text>
                <NeonBorderInput isActive={focused === 'name'}>
                  <TextInput
                    style={[s.input, focused === 'name' && s.inputActive]}
                    placeholder="Jean Dupont ou Ma Société SARL"
                    placeholderTextColor={colors.text.muted}
                    value={fullName}
                    onChangeText={t => { setFullName(t); if (error) clearError(); }}
                    {...f('name')}
                  />
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Email</Text>
                <NeonBorderInput isActive={focused === 'email'}>
                  <TextInput
                    style={[s.input, focused === 'email' && s.inputActive]}
                    placeholder="votre@email.com"
                    placeholderTextColor={colors.text.muted}
                    value={email}
                    onChangeText={t => { setEmail(t); if (error) clearError(); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    {...f('email')}
                  />
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Mot de passe</Text>
                <NeonBorderInput isActive={focused === 'password'}>
                  <View style={s.passwordWrapper}>
                    <TextInput
                      style={[s.input, s.passwordInput, focused === 'password' && s.inputActive]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.text.muted}
                      value={password}
                      onChangeText={t => { setPassword(t); if (error) clearError(); }}
                      secureTextEntry={!showPassword}
                      {...f('password')}
                    />
                    <TouchableOpacity style={s.eyeIcon} onPress={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff size={20} color={colors.text.muted} /> : <Eye size={20} color={colors.text.muted} />}
                    </TouchableOpacity>
                  </View>
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Confirmer le mot de passe</Text>
                <NeonBorderInput isActive={focused === 'confirm'}>
                  <View style={s.passwordWrapper}>
                    <TextInput
                      style={[s.input, s.passwordInput, focused === 'confirm' && s.inputActive]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.text.muted}
                      value={confirmPassword}
                      onChangeText={t => { setConfirmPassword(t); if (error) clearError(); }}
                      secureTextEntry={!showConfirm}
                      {...f('confirm')}
                    />
                    <TouchableOpacity style={s.eyeIcon} onPress={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff size={20} color={colors.text.muted} /> : <Eye size={20} color={colors.text.muted} />}
                    </TouchableOpacity>
                  </View>
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>
                  Code de parrainage <Text style={s.optional}>(optionnel)</Text>
                </Text>
                <NeonBorderInput isActive={focused === 'referral'}>
                  <View style={[s.referralWrapper, focused === 'referral' && s.inputActive]}>
                    <Gift size={18} color={colors.text.muted} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[s.input, s.referralInput]}
                      placeholder="Ex : REF-USR-ABCD"
                      placeholderTextColor={colors.text.muted}
                      value={referralCode}
                      onChangeText={t => setReferralCode(t.toUpperCase())}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      {...f('referral')}
                    />
                  </View>
                </NeonBorderInput>
              </View>
            </View>

            <View style={s.termsContainer}>
              <View style={s.checkboxWrapper}>
                <TouchableOpacity 
                  style={s.checkboxTouchable}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <View style={[s.checkbox, acceptedTerms && s.checkboxChecked]}>
                    {acceptedTerms && (
                      <Text style={s.checkMark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={s.termsText}>
                  J'accepte les{' '}
                  <Text 
                    style={s.termsLink}
                    onPress={() => router.push('/(auth)/privacy-policy')}
                  >
                    conditions d'utilisation
                  </Text>
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.footer}>
        <NeonSubmitButton onPress={handleRegister} loading={loading} disabled={loading} />
        <View style={s.loginRow}>
          <Text style={s.loginRowText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={s.neonLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  container:       { flex: 1, paddingHorizontal: 24 },
  scrollContent:   { paddingTop: 60, paddingBottom: 200 },

  header:          { alignItems: 'flex-start', marginBottom: 28, paddingTop: 16 },
  titleRow:        { flexDirection: 'row', alignItems: 'flex-end' },
  titleSub:        { fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 15 },
  titleScript:     { fontFamily: 'Brittany-Signature', fontSize: 48, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18, paddingHorizontal: 5 },
  titleScriptWrap: {},
  subtitle:        { fontFamily: 'Arimo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'left', letterSpacing: 0.3, marginTop: 4 },

  form:            { width: '100%' },
  inputContainer:  { marginBottom: 20 },
  label:           { fontFamily: 'Arimo-Bold', fontSize: 13, color: colors.text.secondary, marginBottom: 8, fontWeight: '600', letterSpacing: 0.3 },
  optional:        { fontFamily: 'Arimo-Regular', fontSize: 12, color: colors.text.muted, fontWeight: '400' },
  input:           { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12, padding: 16, fontFamily: 'Arimo-Regular', color: colors.text.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 3 },
  inputActive:     { borderColor: 'transparent', backgroundColor: '#030814' },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput:   { paddingRight: 50 },
  eyeIcon:         { position: 'absolute', right: 16, height: '100%', justifyContent: 'center', zIndex: 4 },
  referralWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingLeft: 14, overflow: 'hidden' },
  referralInput:   { flex: 1, backgroundColor: 'transparent', borderWidth: 0, paddingLeft: 4, letterSpacing: 1 },

  termsContainer:  { marginBottom: 20, paddingHorizontal: 0 },
  checkboxWrapper: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  checkboxTouchable: { marginRight: 14, marginTop: 2, justifyContent: 'center', alignItems: 'center' },
  checkbox:        { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.8)' },
  checkboxChecked: { backgroundColor: colors.neon, borderColor: colors.neon, shadowColor: colors.neon, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10, elevation: 6 },
  checkMark:       { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', marginTop: -1 },
  termsText:       { fontSize: 14, color: colors.text.primary, lineHeight: 20, fontWeight: '500', flex: 1 },
  termsLink:       { fontSize: 14, color: colors.neon, fontWeight: '700', textDecorationLine: 'underline' },

  footer:          { position: 'absolute', bottom: 40, left: 24, right: 24, zIndex: 10, alignItems: 'center' },
  loginRow:        { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  loginRowText:    { fontFamily: 'Arimo-Regular', color: colors.text.secondary, fontSize: 14 },
  neonLink:        { fontFamily: 'Arimo-Bold', fontSize: 14, color: '#fff', textShadowColor: '#00eaff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
});
