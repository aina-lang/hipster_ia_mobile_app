import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
// Stripe logic delayed to subscription step
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal } from '../../components/ui/GenericModal';

export default function VerifyEmailScreen() {
  const { email, redirectTo, stripeData, planId, userId } = useLocalSearchParams<{
    email: string;
    redirectTo?: string;
    stripeData?: string;
    planId?: string;
    userId?: string;
  }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aiVerifyEmail } = useAuthStore();
  const navigation = useNavigation();
  const allowNavRef = useRef(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: any, title: string, message: string = '') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // 1. Block back navigation on Android hardware button
  useEffect(() => {
    const onBackPress = () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!allowNavRef.current && !isAuthenticated) {
        showModal('warning', 'Action interdite', 'Veuillez vérifier votre email pour continuer.');
        return true; // Block event
      }
      return false; // Allow event
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  // 2. Block back navigation from UI (swipe, button, etc.)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (allowNavRef.current || isAuthenticated) return;

      e.preventDefault();
      showModal('warning', 'Action interdite', 'Veuillez vérifier votre email pour continuer.');
    });
    return unsubscribe;
  }, [navigation]);

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      showModal('error', 'Erreur', 'Veuillez entrer le code de vérification.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Verify Email (Logs user in)
      await aiVerifyEmail(email as string, code);

      // Allow navigation after success
      allowNavRef.current = true;

      // 2. Proceed to SETUP (Job, Branding, etc.)
      // Payment will happen at the end of setup.
      router.push({
        pathname: '/(onboarding)/setup',
        params: { userId, planId }
      });

      // Navigate based on redirectTo or default onboarding flow
    } catch (e: any) {
      const message = e.response?.data?.message || 'Code invalide ou expiré.';
      setError(message);
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
      const message = e.response?.data?.message || "Erreur lors de l'envoi du nouveau code.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <BackgroundGradientOnboarding darkOverlay={true}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={60} color={colors.primary.main} />
            </View>

            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.subtitle}>
              Nous avons envoyé un code de vérification à :{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={colors.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez le code"
                  placeholderTextColor={colors.text.muted}
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
              </View>

              <NeonButton
                title="Vérifier"
                onPress={handleVerify}
                size="lg"
                variant="premium"
                loading={isLoading}
                style={styles.verifyButton}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Vous n'avez pas reçu le code ? </Text>
                <TouchableOpacity onPress={handleResend} disabled={isResending}>
                  <Text style={[styles.footerLink, isResending && { opacity: 0.5 }]}>
                    {isResending ? 'Envoi...' : 'Renvoyer'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  allowNavRef.current = true;
                  router.replace({
                    pathname: '/(auth)/register',
                    params: { email }
                  });
                }}
              >
                <Text style={styles.backButtonText}>Modifier l'adresse email</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </BackgroundGradientOnboarding>
      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    padding: 20,
    borderRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 24,
    letterSpacing: 8,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
