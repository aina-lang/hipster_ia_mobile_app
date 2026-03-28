import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useWelcomeVideoStore } from '../store/welcomeVideoStore';
import '../global.css';
import { StripeProvider } from '@stripe/stripe-react-native';
import WelcomeScreen from './welcome';
import { StyledStatusBar } from '../components/ui/StyledStatusBar';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { View, Platform, Linking, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';

import * as SystemUI from 'expo-system-ui';

const initializeAuthRef = { current: false };

/** Last path segment — works for `/login`, `/(auth)/login`, localized stacks, etc. */
const AUTH_LAST_SEGMENTS = new Set([
  'login',
  'register',
  'verify-email',
  'verify-otp',
  'forgot-password',
  'reset-password',
  'privacy-policy',
]);
const ONBOARDING_LAST_SEGMENTS = new Set(['packs', 'job', 'branding', 'setup', 'payment']);

/** Flat paths only; kept for tooling / cache compatibility and as first check. */
const AUTH_OR_ONBOARDING_PATH =
  /^\/(login|register|verify-email|verify-otp|forgot-password|reset-password|privacy-policy|packs|job|branding|setup|payment)(\/|$)/i;

function pathLooksLikePublicUnauthFlow(pathname: string | undefined): boolean {
  if (!pathname || pathname === '/') return false;
  if (AUTH_OR_ONBOARDING_PATH.test(pathname)) return true;
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return false;
  const key = last.toLowerCase();
  return AUTH_LAST_SEGMENTS.has(key) || ONBOARDING_LAST_SEGMENTS.has(key);
}

export default function RootLayout() {
  const { user, isAuthenticated, hasFinishedOnboarding, isHydrated, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { videoCompleted, setVideoCompleted } = useWelcomeVideoStore();

  const [fontsLoaded, fontError] = useFonts({
    'Arimo-Regular': require('../assets/fonts/Arimo/Arimo-Regular.ttf'),
    'Arimo-Bold': require('../assets/fonts/Arimo/Arimo-Bold.ttf'),
    'Brittany-Signature': require('../assets/fonts/Brittany/BrittanySignature.ttf')
  });

  useEffect(() => {
    if (fontsLoaded && isHydrated && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated, isInitialized]);



  // On app startup, verify that stored session is still valid
  useEffect(() => {
    // Set root background to black to prevent white flash
    SystemUI.setBackgroundColorAsync('#000000').catch(() => { });
    useWelcomeVideoStore.getState().reset();

    if (!isHydrated || initializeAuthRef.current) {
      return;
    }

    initializeAuthRef.current = true;
    const auth = useAuthStore.getState();
    const initApp = async () => {
      try {
        await auth.initializeAuth();
      } catch (error) {
        console.error('[RootLayout] Initialization error:', error);
      } finally {
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

  // Check if we are in specific groups/pages
  const inAuthGroup = segments.some(s => s.includes('(auth)')) || segments.includes('login') || segments.includes('register') || segments.includes('verify-email');
  const inOnboardingGroup = segments.some(s => s.includes('(onboarding)')) || segments.includes('setup') || segments.includes('branding') || segments.includes('packs') || segments.includes('payment');
  const pathInPublicUnauthFlow = pathLooksLikePublicUnauthFlow(pathname);
  const inUnauthPublicFlow = inAuthGroup || inOnboardingGroup || pathInPublicUnauthFlow;

  useEffect(() => {
    if (!isHydrated || !isInitialized) {
      return;
    }

    console.log('[DEBUG] Path:', pathname, 'Auth:', isAuthenticated, 'Navigating');

    const isWelcomeScreen = segments.includes('welcome');
    
    // Authenticated users should never be on welcome screen
    if (isAuthenticated && isWelcomeScreen) {
      console.log('[RootLayout] Authenticated user on welcome, redirecting to drawer');
      router.replace('/(drawer)');
      return;
    }

    let targetRoute: string | null = null;

    if (isAuthenticated) {
      if (user && !user.isEmailVerified) {
        if (!segments.includes('verify-email')) {
          targetRoute = '/(auth)/verify-email';
        }
      }
      else if (user && user.type === 'ai' && !user.stripeSubscriptionId && !user.planType) {
        if (!segments.includes('packs')) {
          targetRoute = '/(onboarding)/packs';
        }
      }
      else if (user && !user.job) {
        if (!segments.includes('job')) {
          targetRoute = '/(onboarding)/job';
        }
      }
      else if (user && !user.isSetupComplete) {
        if (!segments.includes('branding')) {
          targetRoute = '/(onboarding)/branding';
        }
      }
      else if (inAuthGroup || inOnboardingGroup || !segments.length || segments[0] === '' || segments[0] === 'welcome') {
        targetRoute = '/(drawer)';
      }
    } else {
      // If not authenticated, allow access to (auth) and (onboarding)
      // Only redirect to /welcome if in protected area
      const inProtectedRoute = segments.some(s => s.includes('(drawer)') || s.includes('(guided)') || s.includes('(tabs)'));
      const isAtRoot = !segments.length || segments[0] === '' || segments[0] === 'index';
      
      if (!inUnauthPublicFlow && (inProtectedRoute || isAtRoot)) {
        targetRoute = '/welcome';
      }
    }


    // Check if we need to redirect - direct comparison
    if (targetRoute && targetRoute !== pathname) {
      if (
        targetRoute === '/welcome' &&
        (pathLooksLikePublicUnauthFlow(pathname) || inAuthGroup || inOnboardingGroup)
      ) {
        return;
      }
      console.log(`[RootLayout] Redirecting: auth=${isAuthenticated}, path=${pathname} → ${targetRoute}`);
      router.replace(targetRoute as any);
    }
  }, [isAuthenticated, hasFinishedOnboarding, isHydrated, isInitialized, segments, pathname, inUnauthPublicFlow, user]);

  const handleVideoFinish = React.useCallback(() => {
    console.log('[RootLayout] handleVideoFinish called. Setting videoCompleted=true');
    setVideoCompleted(true);
  }, [setVideoCompleted]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider
          publishableKey="pk_test_51R15MnK5fB5lGbp8C5QAYcALGWTBBmTmYxsnMnigeUNUg2DvsR9u4xbsF1GNzDIqiQxFqz9Dg10kEttfcpbr5DVX00yGKXocyS"
          merchantIdentifier="merchant.com.hipster">
          {fontsLoaded && !fontError && isInitialized ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#11111a' },
              }}>
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(drawer)" />
              <Stack.Screen name="(guided)" />
            </Stack>
          ) : <View style={{ flex: 1, backgroundColor: '#000000' }} />}

          <StyledStatusBar theme="dark" translucent={true} />

          <>
            {!isAuthenticated &&
              !inUnauthPublicFlow &&
              (!isHydrated || !isInitialized || !videoCompleted) && (
                <WelcomeScreen onVideoFinish={handleVideoFinish} />
              )}
          </>
        </StripeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

