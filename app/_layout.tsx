import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import '../global.css';
import { StripeProvider } from '@stripe/stripe-react-native';
import { LoadingTransition } from '../components/ui/LoadingTransition';
import { StyledStatusBar } from '../components/ui/StyledStatusBar';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

import * as SystemUI from 'expo-system-ui';

export default function RootLayout() {
  const { user, isAuthenticated, hasFinishedOnboarding, isHydrated, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(true);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [videoFinished, setVideoFinished] = React.useState(false);
  const initializeAuthRef = React.useRef(false);

  // On app startup, verify that stored session is still valid
  useEffect(() => {
    // Set root background to black to prevent white flash
    SystemUI.setBackgroundColorAsync('#000000').catch(() => { });

    if (!isHydrated) {
      console.log('[RootLayout] Waiting for hydration...');
      return;
    }

    // Only run initialization once
    if (initializeAuthRef.current) {
      console.log('[RootLayout] Already initialized, skipping...');
      return;
    }

    initializeAuthRef.current = true;
    console.log('[RootLayout] Starting initialization...');
    const auth = useAuthStore.getState();
    const initApp = async () => {
      try {
        // Verify the stored session is still valid
        console.log('[RootLayout] Calling initializeAuth()...');
        await auth.initializeAuth();
        console.log('[RootLayout] initializeAuth() complete');
      } catch (error) {
        console.error('[RootLayout] Initialization error:', error);
      } finally {
        // Mark initialization as complete so routing can proceed
        console.log('[RootLayout] Setting isInitialized=true');
        setIsInitialized(true);
      }
    };

    initApp();
  }, [isHydrated]);

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
    if (!isHydrated || !isInitialized) {
      console.log(`[RootLayout] Routing blocked - isHydrated=${isHydrated}, isInitialized=${isInitialized}`);
      return;
    }

    console.log(`[RootLayout] Starting routing decision - isAuthenticated=${isAuthenticated}, user=${user?.email}, pathname=${pathname}`);

    // Check if we are in specific groups/pages
    const inAuthGroup = segments.some(s => s.includes('(auth)')) || segments.includes('login') || segments.includes('register') || segments.includes('verify-email');
    const inOnboardingGroup = segments.some(s => s.includes('(onboarding)')) || segments.includes('setup') || segments.includes('branding') || segments.includes('packs') || segments.includes('welcome') || segments.includes('payment');

    let targetRoute: string | null = null;

    if (isAuthenticated) {
      if (user && !user.isEmailVerified) {
        if (!segments.includes('verify-email')) {
          targetRoute = '/(auth)/verify-email';
        }
      }
      else if (user && !user.isSetupComplete) {
        if (!segments.includes('branding')) {
          targetRoute = '/(onboarding)/branding';
        }
      }
      else if (inAuthGroup || inOnboardingGroup || !segments[0]) {
        targetRoute = '/(drawer)';
      }
    } else {
      // If not authenticated, always land on Welcome if not already in auth/onboarding
      if (!inAuthGroup && !inOnboardingGroup) {
        targetRoute = '/(onboarding)/welcome';
      }
    }

    // Pathname normalization for comparison: removes parentheses for group names
    // Examples: /(onboarding)/welcome -> /welcome, /(drawer) -> /
    const normalizePath = (path: string) => path.replace(/\/\([^)]+\)/g, '').replace(/\/index$/, '') || '/';
    const normalizedTarget = targetRoute ? normalizePath(targetRoute) : null;
    const normalizedPathname = normalizePath(pathname);

    if (targetRoute && normalizedTarget !== normalizedPathname) {
      console.log(`[RootLayout] Routing to: ${targetRoute} (normalized current: ${normalizedPathname})`);

      // CRITICAL: Only redirect if video is finished
      if (!videoFinished) {
        console.log('[RootLayout] Redirect blocked: video not finished');
        return;
      }

      setIsRouting(true);
      router.replace(targetRoute as any);
    } else {
      console.log(`[RootLayout] No routing needed or arrived at target (normalized: ${normalizedPathname})`);
      setIsRouting(false);
    }
  }, [isAuthenticated, hasFinishedOnboarding, isHydrated, isInitialized, segments, pathname, videoFinished]);

  if (!isHydrated || isRouting || !isInitialized || !videoFinished) {
    return <LoadingTransition onVideoFinish={() => setVideoFinished(true)} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider
          publishableKey="pk_test_51SCdnjFhrfQ5vRxFnG03V2aEFEsGvoTSbhEa1CyB2J07h6W8VVtNbirPeJtT9yOnLw3EPFlfPqARXKBBRAXdFz1G00xhCi28vk"
          merchantIdentifier="merchant.com.hipster">
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName={isAuthenticated ? '(drawer)' : '(onboarding)'}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="(guided)" />
          </Stack>

          <StyledStatusBar theme="dark" translucent={true} />
        </StripeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

