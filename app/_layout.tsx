import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import '../global.css';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function RootLayout() {
  const { isAuthenticated, hasFinishedOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for the next tick to ensure nested layout is mounted
    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';
      const inTabsGroup = segments[0] === '(tabs)';

      if (
        !isAuthenticated &&
        !inAuthGroup &&
        segments[0] !== '(onboarding)' &&
        segments[0] !== undefined
      ) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated) {
        if (!hasFinishedOnboarding && !inOnboardingGroup) {
          router.replace('/(onboarding)/setup');
        } else if (
          hasFinishedOnboarding &&
          (inAuthGroup || inOnboardingGroup || segments[0] === undefined)
        ) {
          router.replace('/(drawer)');
        }
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, hasFinishedOnboarding, segments]);

  return (
    <>
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
      
    </>
  );
}
