import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import '../global.css';
import { StripeProvider } from '@stripe/stripe-react-native';
import { LoadingTransition } from '../components/ui/LoadingTransition';

export default function RootLayout() {
  const { isAuthenticated, hasFinishedOnboarding, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';

      let targetRoute = null;

      if (!hasFinishedOnboarding) {
        if (!inOnboardingGroup) {
          // On commence l'onboarding directement par l'étape d'âge
          targetRoute = isAuthenticated ? '/(onboarding)/age' : '/(onboarding)/welcome';
        }
      } else {
        if (isAuthenticated) {
          if (inAuthGroup || inOnboardingGroup || !segments[0]) {
            targetRoute = '/(drawer)';
          }
        } else {
          if (!inAuthGroup) {
            targetRoute = '/(auth)/login';
          }
        }
      }

      if (targetRoute) {
        router.replace(targetRoute as any);
      } else {
        setIsRouting(false);
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, hasFinishedOnboarding, isHydrated, segments]);

  if (!isHydrated || isRouting) {
    return <LoadingTransition />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider
          publishableKey="pk_test_placeholder"
          merchantIdentifier="merchant.com.hipster">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="(guided)" />
          </Stack>

          <StatusBar style="light" />
        </StripeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
