import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Text
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff, Gift } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';

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

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { aiRegister, error, clearError } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const showModal = (type: any, title: string, message: string = '') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
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
      const { brandingColor, job } = useOnboardingStore.getState();
      const response = await aiRegister({
        name: fullName,
        email,
        password,
        planId: selectedPlan || 'curieux',
        brandingColor,
        job,
        referralCode: referralCode.trim() || undefined,
      });

      const registerRes = response?.data ?? response;

      showModal('success', 'Compte créé !', 'Vérifiez votre email pour activer votre compte.');

      setTimeout(() => {
        setModalVisible(false);
        router.push({
          pathname: '/(auth)/verify-email',
          params: {
            email,
            userId: registerRes.userId,
            planId: selectedPlan
          },
        });
      }, 1500);

    } catch (e: any) {
      setLocalLoading(false);
      const message = e.response?.data?.message || e.message || 'Une erreur est survenue.';
      showModal('error', "Échec de l'inscription", message);
    }
  };

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleFirst}>Créer un </Text>
              <Text style={styles.titleSecond}>compte</Text>
            </View>
            <Text style={styles.subtitle}>Finalisez votre inscription pour accéder à Hipster IA.</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom / Nom d'entreprise</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'fullName' && styles.inputFocused
                  ]}
                  placeholder="Jean Dupont ou Ma Société SARL"
                  placeholderTextColor={colors.text.muted}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (error) clearError();
                  }}
                  onFocus={() => handleFocus('fullName')}
                  onBlur={handleBlur}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'email' && styles.inputFocused
                  ]}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) clearError();
                  }}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      focusedField === 'password' && styles.inputFocused
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) clearError();
                    }}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
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
                    style={[
                      styles.input,
                      styles.passwordInput,
                      focusedField === 'confirmPassword' && styles.inputFocused
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error) clearError();
                    }}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                    secureTextEntry={!showConfirmPassword}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Code de parrainage <Text style={styles.optional}>(optionnel)</Text></Text>
                <View style={styles.referralWrapper}>
                  <Gift size={18} color={colors.text.muted} style={styles.referralIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      styles.referralInput,
                      focusedField === 'referral' && styles.inputFocused
                    ]}
                    placeholder="Ex : REF-USR-ABCD"
                    placeholderTextColor={colors.text.muted}
                    value={referralCode}
                    onChangeText={(text) => setReferralCode(text.toUpperCase())}
                    onFocus={() => handleFocus('referral')}
                    onBlur={handleBlur}
                    autoCapitalize="characters"
                    autoCorrect={false}
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
        <View style={styles.loginRow}>
          <Text style={styles.loginRowText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginRowLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 100,
    paddingBottom: 200,
  },
  content: {
    paddingTop: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10
  },
  titleFirst: {
    fontSize: 32,
    color: colors.text.primary,
    fontFamily: 'Arimo-Bold',
  },
  titleSecond: {
    fontSize: 36,
    color: colors.text.primary,
    paddingHorizontal: 5,
    fontFamily: 'Brittany-Signature',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 30,
  },
  form: {
    width: '100%',
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
  inputFocused: {
    borderWidth: 2,
    borderColor: '#1e9bff',
    backgroundColor: '#030814',
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
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginRowText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  loginRowLink: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  optional: {
    color: colors.text.muted,
    fontWeight: '400',
    fontSize: 12,
  },
  referralWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    paddingLeft: 14,
  },
  referralIcon: {
    marginRight: 8,
  },
  referralInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 4,
    letterSpacing: 1,
  },
});