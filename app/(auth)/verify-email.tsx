import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, BackHandler,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonLink } from '../../components/ui/NeonLink';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const NEON_BLUE = colors.neonBlue;

export default function VerifyEmailScreen() {
  const { email, planId, userId } = useLocalSearchParams<{
    email: string;
    redirectTo?: string;
    stripeData?: string;
    planId?: string;
    userId?: string;
  }>();

  const [code, setCode]           = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [modal, setModal]         = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const { aiVerifyEmail } = useAuthStore();
  const navigation        = useNavigation();
  const allowNavRef       = useRef(false);

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  useEffect(() => {
    const onBackPress = () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!allowNavRef.current && !isAuthenticated) {
        showModal('warning', 'Action interdite', 'Veuillez vérifier votre email pour continuer.');
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (allowNavRef.current || isAuthenticated) return;
      e.preventDefault();
      showModal('warning', 'Action interdite', 'Veuillez vérifier votre email pour continuer.');
    });
    return unsub;
  }, [navigation]);

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      showModal('error', 'Erreur', 'Veuillez entrer le code de vérification.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await aiVerifyEmail(email as string, code);
      allowNavRef.current = true;
      // ✅ Utiliser router.push au lieu de router.replace pour éviter les problèmes de navigation
      router.push({ pathname: '/(onboarding)/packs', params: { userId, planId } });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      await api.post('/ai/auth/resend-otp', { email });
      showModal('success', 'Envoyé', 'Un nouveau code a été envoyé à votre adresse email.');
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de l'envoi du nouveau code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <BackgroundGradientOnboarding darkOverlay>
        <ScreenHeader
          titleSub="Vérifier"
          titleScript="votre email"
          onBack={() => {
            allowNavRef.current = true;
            router.replace({ pathname: '/(auth)/register', params: { email } });
          }}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
          <Animated.View entering={FadeInDown.duration(800)} style={s.content}>

            <View style={s.iconContainer}>
              <ShieldCheck size={52} style={s.icon} />
            </View>

            <Text style={s.subtitle}>
              Nous avons envoyé un code de vérification à{'\n'}
              <Text style={s.emailText}>{email}</Text>
            </Text>

            {error && (
              <View style={s.errorContainer}>
                <AlertCircle size={18} color={colors.status.error} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.form}>
              <TextInput
                style={s.input}
                placeholder="Entrez le code"
                placeholderTextColor="#6b7280"
                value={code}
                onChangeText={t => { setCode(t); setError(null); }}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />

              <NeonActionButton
                label="Vérifier"
                onPress={handleVerify}
                loading={isLoading}
                disabled={isLoading}
              />

              <View style={s.footer}>
                <Text style={s.footerText}>Vous n'avez pas reçu le code ? </Text>
                <NeonLink
                  label={isResending ? 'Envoi...' : 'Renvoyer'}
                  onPress={handleResend}
                  style={isResending ? { opacity: 0.5 } : undefined}
                />
              </View>

              <TouchableOpacity
                style={s.changeEmail}
                onPress={() => {
                  allowNavRef.current = true;
                  router.replace({ pathname: '/(auth)/register', params: { email } });
                }}
              >
                <Text style={s.termsLink}>Modifier l'adresse email</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </BackgroundGradientOnboarding>

      <GenericModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(m => ({ ...m, visible: false }))}
      />
    </>
  );
}

const s = StyleSheet.create({
  kav:     { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  iconContainer: {
    marginBottom: 20,
    backgroundColor: colors.darkSlateBlue,
    padding: 20,
    borderRadius: 30
  },
  icon: {
    color : 'white',
    shadowColor: NEON_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3
  },
  subtitle: {
    fontFamily: fonts.arimo.regular,
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontFamily: fonts.arimo.bold,
    color: NEON_BLUE,
  },
  termsLink: {
    fontFamily: fonts.arimo.regular,
    fontSize: 11,
    color: 'white',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    textDecorationLine: 'underline',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    width: '100%',
  },
  errorText: {
    fontFamily: fonts.arimo.regular,
    color: colors.status.error,
    fontSize: 13,
    flex: 1,
  },

  form: { width: '100%' },

  input: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontFamily: fonts.arimo.regular,
    color: 'white',
    borderWidth: 1,
    borderColor: '#ffffff14',
    fontSize: 24,
    letterSpacing: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16
  },
  footerText: {
    fontFamily: fonts.arimo.regular,
    color: colors.gray,
    fontSize: 14,
  },

  changeEmail: { alignItems: 'center' },
  changeEmailText: {
    fontFamily: fonts.arimo.regular,
    color: colors.gray,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});