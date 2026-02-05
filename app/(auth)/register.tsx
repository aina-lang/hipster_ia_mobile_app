import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function RegisterScreen() {
  // Pull data from onboarding store
  const {
    lastName: storeLast,
    job, selectedPlan,
    brandingColor, logoUri, avatarUri
  } = useOnboardingStore();

  // const [lastName, setLastName] = useState(storeLast || '');
  // const [firstName, setFirstName] = useState(storeFirst || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { aiRegister, updateAiProfile, uploadAvatar, uploadLogo, isLoading, error, clearError, user } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const showModal = (type: any, title: string, message: string = '') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      showModal('error', 'Erreur de mot de passe', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLocalLoading(true);
    showModal('loading', 'Création du compte...', 'Veuillez patienter');

    try {
      // 1. Register User
      const registerRes = await aiRegister({
        lastName: storeLast || 'User', // Use collected name from store
        email,
        password
      });

      // 2. We need the user to be logged in/token set, which aiRegister usually does or returns token.
      // Store logic: aiRegister sets isLoading=false but does NOT automatically log them in usually?
      // Based on authStore, aiRegister returns data but doesn't set global user state with token unless we verify email first?
      // Wait, aiRegister is just POST /ai/auth/register. It typically returns { message: '...' } or prompts verification.

      // IF backend requires verification first, we cannot update profile yet because we don't have a token/user ID context 
      // UNLESS the registration response returns a temp token or we do it after email verification.

      // Assumption: User needs to verify email.
      // We will clear the onboarding Store OR keep it until verification matches.
      // HOWEVER, the user asked for this flow.

      // Strategy: 
      // A. If `aiRegister` keeps us logged out: We redirect to VerifyEmail. 
      //    We should save the profile attributes to be updated AFTER verification (part of onboardingStore persistence).
      //    This means `verify-email` screen needs to handle "Post-Verification Setup".

      // B. If `aiRegister` logs us in (some devs do this for UX):
      //    We can update immediately.

      // Checking authStore: aiRegister just returns data. It does NOT set user/token.

      // OK. We must redirect to Verify Email.
      // BUT, we have `firstName`, `companyName`, `job`, `brandingColor`, etc. pending.
      // Ideally these should have been sent in `aiRegister` payload effectively creating the profile with them.
      // But `aiRegister` payload in store is limited.

      // Workaround: We proceed to Verify Email. After "Verify", we are logged in. 
      // Then we check `onboardingStore`. If data exists, we run the `finalizeSetup` logic.
      // The user is redirected to `(onboarding)/ready` or similar?
      // Or we assume `aiRegister` is updated to accept these fields? 
      // I will stick to the plan: Register -> Verify -> Then Update?
      // The "Ready" screen is typically after setup.

      // Let's modify the flow:
      // Register success -> Redirect to Verify Email.
      // Verify Email success -> Redirect to a new "Finalizing..." screen or handle it in `verify-email.tsx`.

      showModal('success', 'Compte créé !', 'Vérifiez votre email pour activer votre compte.');

      setTimeout(() => {
        setModalVisible(false);
        // First verify email, then choose subscription plan
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email, redirectTo: 'subscription' },
        });
      }, 1500);

    } catch (e: any) {
      setLocalLoading(false);
      const message = e.response?.data?.message || e.message || 'Une erreur est survenue.';
      showModal('error', "Échec de l'inscription", message);
    }
  };

  return (
    <BackgroundGradientOnboarding blurIntensity={90}>
      <StepIndicator currentStep={3} totalSteps={3} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Finalisez votre inscription pour accéder à Hipster IA.</Text>

            <View style={styles.form}>
              {/* Name fields are collected in Step 1 */}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) clearError();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) clearError();
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color={colors.text.muted} />
                    ) : (
                      <Eye size={20} color={colors.text.muted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error) clearError();
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                </View>
              </View>

            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <NeonButton
          title="S'inscrire"
          onPress={handleRegister}
          size="lg"
          variant="premium"
          loading={localLoading}
          disabled={localLoading}
          style={styles.registerButton}
        />
      </View>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingTop: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  registerButton: {
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    zIndex: 10,
  },
});
