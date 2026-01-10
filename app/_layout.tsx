import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import '../global.css';

export default function RootLayout() {
  const { isAuthenticated, hasFinishedOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (
      !isAuthenticated &&
      !inAuthGroup &&
      segments[0] !== '(onboarding)' &&
      segments[0] !== undefined
    ) {
      // If not authenticated and not in auth group, redirect to login
      // Exception: allow onboarding for now if that's the start
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (!hasFinishedOnboarding && !inOnboardingGroup) {
        router.replace('/(onboarding)/setup');
      } else if (
        hasFinishedOnboarding &&
        (inAuthGroup || inOnboardingGroup || segments[0] === undefined)
      ) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, hasFinishedOnboarding, segments]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
