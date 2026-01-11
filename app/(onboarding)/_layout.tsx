import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import '../../global.css';

export default function OnboardingLayout() {
  const router = useRouter();
  const { finishOnboarding } = useAuthStore();

  const handleSkip = () => {
    finishOnboarding();
    router.replace('/(auth)/register');
  };

  return (
    <ImageBackground
      source={require('../../assets/bg.jpg')}
      style={styles.container}
      resizeMode="cover">
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
