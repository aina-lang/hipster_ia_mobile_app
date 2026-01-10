import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      Alert.alert('Erreur', 'Veuillez entrer le code de vérification.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.post('/ai/auth/verify-email', { email, code });
      Alert.alert('Succès', 'Votre email a été vérifié. Vous pouvez maintenant vous connecter.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') },
      ]);
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
      Alert.alert('Envoyé', 'Un nouveau code a été envoyé à votre adresse email.');
    } catch (e: any) {
      setError("Erreur lors de l'envoi du nouveau code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <BackgroundGradient>
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

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Modifier l'adresse email</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </BackgroundGradient>
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
