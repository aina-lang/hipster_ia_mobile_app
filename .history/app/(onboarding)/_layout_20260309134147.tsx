import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import '../../global.css';
import { colors } from 'theme/colors';

export default function OnboardingLayout() {
  const router = useRouter();
  const { finishOnboarding } = useAuthStore();

  const handleSkip = () => {
    finishOnboarding();
    router.replace('/(auth)/register');
  };

  return (
    <View
    
      style={styles.container}
   >
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#11111a"
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
