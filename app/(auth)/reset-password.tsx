import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import type { TextInput as RNTextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, useSharedValue } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';

export default function ResetPasswordScreen() {
  const { email, code } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  const [modal, setModal] = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const { resetPassword } = useAuthStore();

  const showModal = (type: any, title: string, message: string = '') =>
    setModal({ visible: true, type, title, message });

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    if (!newPassword || !confirmPassword) {
      showModal('warning', 'Champs manquants', 'Veuillez remplir tous les champs pour réinitialiser le mot de passe.');
      return;
    }

    if (newPassword.length < 8) {
      showModal('warning', 'Mot de passe trop court', 'Le nouveau mot de passe doit faire au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal('warning', 'Mots de passe différents', 'Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    showModal('loading', 'Réinitialisation...', 'Veuillez patienter');

    try {
      await resetPassword(email as string, code as string, newPassword);
      setIsLoading(false);
      showModal('success', 'Succès', 'Votre mot de passe a été réinitialisé avec succès.');
      setTimeout(() => {
        setModal(m => ({ ...m, visible: false }));
        router.replace('/(auth)/login');
      }, 3000);
    } catch (e: any) {
      setIsLoading(false);
      showModal('error', 'Échec de la réinitialisation', e.message || 'Une erreur est survenue.');
    }
  };

  const scrollY = useSharedValue(0);

  return (
    <BackgroundGradientOnboarding darkOverlay={true}>
      <ScreenHeader 
        titleSub="Nouveau" 
        titleScript="Mot de passe" 
        onBack={() => router.replace('/(auth)/login')} 
        scrollY={scrollY}
      />

      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
          <Text style={styles.subtitle}>Entrez votre nouveau mot de passe pour sécuriser votre compte.</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <NeonBorderInput isActive={focused === 'new'}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, focused === 'new' && styles.inputActive]}
                    placeholder="••••••••"
                    placeholderTextColor="#6b7280"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setFocused('new')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                  </TouchableOpacity>
                </View>
              </NeonBorderInput>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <NeonBorderInput isActive={focused === 'confirm'}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={[styles.input, styles.passwordInput, focused === 'confirm' && styles.inputActive]}
                    placeholder="••••••••"
                    placeholderTextColor="#6b7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                  </TouchableOpacity>
                </View>
              </NeonBorderInput>
            </View>

            <NeonActionButton
              label="Réinitialiser"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>

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

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
  },
  subtitle: {
    fontFamily: fonts.arimo.regular,
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 30,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: colors.gray,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
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
  inputActive: {
    borderColor: 'transparent',
    backgroundColor: colors.midnightBlue,
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
    zIndex: 4,
  },
});
