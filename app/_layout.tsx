import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import '../global.css';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  const { isAuthenticated, hasFinishedOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for the next tick to ensure nested layout is mounted
    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';
      const inDrawerGroup = segments[0] === '(drawer)';

      if (!hasFinishedOnboarding) {
        // Scenario 1: First install / Onboarding not finished
        // Force redirect to onboarding if not already there
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)/welcome');
        }
      } else {
        // Onboarding finished
        if (isAuthenticated) {
          // Scenario 3: Connected -> Go to Home (Drawer)
          // If we are in Auth or Onboarding or Root, go to Drawer
          if (inAuthGroup || inOnboardingGroup) {
            router.replace('/(drawer)');
          }
        } else {
          // Scenario 2: Not connected -> Go to Login
          // If we are getting redirected from onboarding or root, go to Login
          if (!inAuthGroup) {
            router.replace('/(auth)/login');
          }
        }
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, hasFinishedOnboarding, segments]);

  return (
    <StripeProvider
      publishableKey="pk_test_placeholder"
      merchantIdentifier="merchant.com.hipster" // Added to avoid 'merchantIdentifier' undefined error
    >
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
