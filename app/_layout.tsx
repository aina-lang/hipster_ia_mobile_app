import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import '../global.css';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { StripeProvider } from '@stripe/stripe-react-native';

import { LoadingTransition } from '../components/ui/LoadingTransition';

export default function RootLayout() {
  const { isAuthenticated, hasFinishedOnboarding, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(true);

  useEffect(() => {
    // Only perform routing once the store is hydrated (session restored)
    if (!isHydrated) return;

    // Use a small delay to ensure segments are updated and layout is settled
    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';

      let targetRoute = null;

      if (!hasFinishedOnboarding) {
        if (!inOnboardingGroup) {
          targetRoute = '/(onboarding)/welcome';
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
        // If we are already on the right route, or no redirect is needed
        setIsRouting(false);
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, hasFinishedOnboarding, isHydrated, segments]);

  // Show premium splash while hydrating or during the initial routing phase
  if (!isHydrated || isRouting) {
    return <LoadingTransition />;
  }

  return (
    <StripeProvider publishableKey="pk_test_placeholder" merchantIdentifier="merchant.com.hipster">
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="(guided)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </StripeProvider>
  );
}
