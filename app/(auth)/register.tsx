import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff, Gift } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonLink } from '../../components/ui/NeonLink';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';

export default function RegisterScreen() {
  const { selectedPlan } = useOnboardingStore();
  const { aiRegister, error, clearError } = useAuthStore();
  const { setIsReturningFromBack } = useWelcomeVideoStore();
  const params = useLocalSearchParams();
  const fromWelcome = params?.from === 'welcome';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const f = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!acceptedTerms) {
      showModal('warning', "Conditions non acceptées", "Vous devez accepter les conditions d'utilisation pour continuer.");
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
        useWelcomeVideoStore.getState().clearOpenedAuthFromWelcome();
        router.push({ pathname: '/(auth)/verify-email', params: { email, userId: res.userId, planId: selectedPlan } });
      }, 1500);
    } catch (e: any) {
      setLoading(false);
      showModal('error', "Échec de l'inscription", e.response?.data?.message || e.message || 'Une erreur est survenue.');
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>

        <ScreenHeader titleSub="Créer un" titleScript="compte" onBack={() => {
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

              <View style={s.inputContainer}>
                <Text style={s.label}>Nom / Nom d'entreprise</Text>
                <NeonBorderInput isActive={focused === 'name'}>
                  <TextInput style={[s.input, focused === 'name' && s.inputActive]} placeholder="Jean Dupont ou Ma Société SARL" placeholderTextColor="#6b7280" value={fullName} onChangeText={t => { setFullName(t); if (error) clearError(); }} {...f('name')} />
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Email</Text>
                <NeonBorderInput isActive={focused === 'email'}>
                  <TextInput style={[s.input, focused === 'email' && s.inputActive]} placeholder="votre@email.com" placeholderTextColor="#6b7280" value={email} onChangeText={t => { setEmail(t); if (error) clearError(); }} autoCapitalize="none" keyboardType="email-address" {...f('email')} />
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Mot de passe</Text>
                <NeonBorderInput isActive={focused === 'password'}>
                  <TextInput style={[s.input, focused === 'password' && s.inputActive]} placeholder="••••••••" placeholderTextColor="#6b7280" value={password} onChangeText={t => { setPassword(t); if (error) clearError(); }} secureTextEntry={true} {...f('password')} />
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Confirmer le mot de passe</Text>
                <NeonBorderInput isActive={focused === 'confirm'}>
                  <View style={s.passwordWrapper}>
                    <TextInput style={[s.input, s.passwordInput, focused === 'confirm' && s.inputActive]} placeholder="••••••••" placeholderTextColor="#6b7280" value={confirmPassword} onChangeText={t => { setConfirmPassword(t); if (error) clearError(); }} secureTextEntry={!showConfirm} {...f('confirm')} />
                    <TouchableOpacity style={s.eyeIcon} onPress={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </TouchableOpacity>
                  </View>
                </NeonBorderInput>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Code de parrainage <Text style={s.optional}>(optionnel)</Text></Text>
                <NeonBorderInput isActive={focused === 'referral'}>
                  <View style={s.passwordWrapper}>
                    <TextInput style={[s.input, s.passwordInput, focused === 'referral' && s.inputActive]} placeholder="Ex : REF-USR-ABCD" placeholderTextColor="#6b7280" value={referralCode} onChangeText={t => setReferralCode(t.toUpperCase())} autoCapitalize="characters" autoCorrect={false} {...f('referral')} />
                    <View style={s.eyeIcon} pointerEvents="none">
                      <Gift size={18} color="#6b7280" />
                    </View>
                  </View>
                </NeonBorderInput>
              </View>

              <View style={s.termsContainer}>
                <TouchableOpacity style={s.checkboxWrapper} onPress={() => setAcceptedTerms(v => !v)} activeOpacity={0.8}>
                  <View style={[s.checkbox, acceptedTerms && s.checkboxChecked]}>
                    {acceptedTerms && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={s.termsText} numberOfLines={1}>
                    J'accepte les{' '}
                    <Text style={s.termsLink} onPress={() => router.push('/(auth)/privacy-policy')}>
                      conditions générales de vente des CGV
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <NeonActionButton
                label="S'inscrire"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
              />

              <View style={s.footer}>
                <Text style={s.footerText}>Déjà un compte ? </Text>
                <NeonLink label="Se connecter" onPress={() => router.push('/(auth)/login')} />
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  content: { flex: 1, justifyContent: 'center', paddingBottom: 20 },
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
  optional: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: colors.gray,
    fontWeight: '400',
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

  termsContainer: { marginBottom: 24 },
  checkboxWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkboxChecked: {
    backgroundColor: colors.darkSlateBlue,
    borderColor: colors.gray,
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  checkbox: {
    width: 19, height: 19,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkSlateBlue,
    marginRight: 8,
    flexShrink: 0,
  },
  checkMark: { fontSize: 11, color: 'white', fontWeight: '900', includeFontPadding: false, lineHeight: 13 },
  termsText: { fontSize: 11, color: 'white', lineHeight: 14, flex: 1, flexWrap: 'nowrap' },
  termsLink: {
    fontFamily: fonts.arimo.regular,
    fontSize: 11,
    color: 'white',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    textDecorationLine: 'underline',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { fontFamily: fonts.arimo.regular, color: '#9ca3af', fontSize: 14 },
});