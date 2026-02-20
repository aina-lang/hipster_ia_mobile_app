// Polyfill for Reflect.construct to fix "Unable to activate keep awake" crash in some environments
// if (typeof Reflect === 'undefined' || !Reflect.construct) {
//   // @ts-ignore
//   require('harmony-reflect'); // Or a simple shim if harmony-reflect isn't available
//   if (typeof Reflect === 'undefined' || !Reflect.construct) {
//     (global as any).Reflect = (global as any).Reflect || {};
//     (global as any).Reflect.construct = function (Target: any, args: any, newTarget: any) {
//       const a = [null];
//       a.push.apply(a, args);
//       const Constructor = Target.bind.apply(Target, a);
//       const instance = new Constructor();
//       if (newTarget) Object.setPrototypeOf(instance, newTarget.prototype);
//       return instance;
//     };
//   }
// }

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import '../global.css';
import { StripeProvider } from '@stripe/stripe-react-native';
import { LoadingTransition } from '../components/ui/LoadingTransition';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export default function RootLayout() {
  const { user, isAuthenticated, hasFinishedOnboarding, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(true);

  useEffect(() => {
    // Request all necessary permissions upfront
    const requestPermissions = async () => {
      try {
        await MediaLibrary.requestPermissionsAsync();
        await Notifications.requestPermissionsAsync();
        await Audio.requestPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        await ImagePicker.requestCameraPermissionsAsync();

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (e) {
        console.warn('Initial permission request failed:', e);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as { fileUri?: string };
      const { fileUri } = data;
      if (fileUri) {
        Sharing.shareAsync(fileUri).catch(err => {
          console.error('Failed to open file:', err);
        });
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const timeout = setTimeout(() => {
      const inAuthGroup = segments.some(s => s.includes('(auth)')) || segments.includes('login') || segments.includes('register') || segments.includes('verify-email');
      const inOnboardingGroup = segments.some(s => s.includes('(onboarding)')) || segments.includes('setup') || segments.includes('branding') || segments.includes('packs') || segments.includes('welcome') || segments.includes('payment');
      let targetRoute: string | null = null;

      if (isAuthenticated) {
        // 1. Check if email is verified
        if (user && !user.isEmailVerified) {
          if (!segments.includes('verify-email')) {
            targetRoute = '/(auth)/verify-email';
          }
        }
        // 2. Check if onboarding (branding) is complete
        else if (!hasFinishedOnboarding) {
          if (!segments.includes('branding')) {
            targetRoute = '/(onboarding)/branding';
          }
        }
        // 3. Normal app access
        else {
          if (inAuthGroup || inOnboardingGroup || !segments[0]) {
            targetRoute = '/(drawer)';
          }
        }
      } else {
        // If not authenticated, always land on Welcome 
        // (Login/Register are accessible from there)
        if (!inAuthGroup && !inOnboardingGroup) {
          targetRoute = '/(onboarding)/welcome';
        }
      }

      if (targetRoute && targetRoute !== '/' + segments.join('/')) {
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
          publishableKey="pk_test_51SCdnjFhrfQ5vRxFnG03V2aEFEsGvoTSbhEa1CyB2J07h6W8VVtNbirPeJtT9yOnLw3EPFlfPqARXKBBRAXdFz1G00xhCi28vk"
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
