import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
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
import { View, Platform, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';

import * as SystemUI from 'expo-system-ui';

const initializeAuthRef = { current: false };

export default function RootLayout() {
  const { user, isAuthenticated, hasFinishedOnboarding, isHydrated, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(true);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [videoFinished, setVideoFinished] = React.useState(false);
  const routingRef = React.useRef(false);

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

  useEffect(() => {
    if (!isHydrated || !isInitialized) {
      return;
    }

    // Check if we are in specific groups/pages
    const inAuthGroup = segments.some(s => s.includes('(auth)')) || segments.includes('login') || segments.includes('register') || segments.includes('verify-email');
    const inOnboardingGroup = segments.some(s => s.includes('(onboarding)')) || segments.includes('setup') || segments.includes('branding') || segments.includes('packs') || segments.includes('payment');

    let targetRoute: string | null = null;

    if (isAuthenticated) {
      if (user && !user.isEmailVerified) {
        if (!segments.includes('verify-email')) {
          targetRoute = '/(auth)/verify-email';
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
      // If not authenticated, redirect to /welcome if we are in a protected area or at the root path
      const inProtectedRoute = segments.some(s => s.includes('(drawer)') || s.includes('(guided)') || s.includes('(tabs)'));
      const isAtRoot = !segments.length || segments[0] === '' || segments[0] === 'index';
      
      // ONLY redirect if we are NOT already routing somewhere
      if (!isRouting && (inProtectedRoute || isAtRoot)) {
        targetRoute = '/welcome';
      }
    }


    // Pathname normalization for comparison: removes parentheses for group names
    // Examples: /(onboarding)/welcome -> /welcome, /(drawer) -> /
    const normalizePath = (p: string) => {
      if (!p) return '/';
      let normalized = p.startsWith('/') ? p : '/' + p;
      // Remove groups like (auth) or (drawer)
      normalized = normalized.replace(/\/\([^)]+\)/g, '');
      // Remove trailing index
      normalized = normalized.replace(/\/index$/, '');
      // Ensure it stays at least /
      return normalized || '/';
    };

    const normalizedTarget = targetRoute ? normalizePath(targetRoute) : null;
    const normalizedPathname = normalizePath(pathname);

    // DEBUG: Only log if there's a potential redirection or routing in progress
    if (targetRoute || isRouting) {
      console.log(`[RootLayout] Redirection: auth=${isAuthenticated}, path=${pathname}, target=${targetRoute}, isRouting=${isRouting}`);
    }

    if (targetRoute && normalizedTarget !== normalizedPathname) {
      // CRITICAL: Only redirect if video is finished and we haven't started routing yet
      if (!videoFinished || routingRef.current) {
        return;
      }

      routingRef.current = true;
      setIsRouting(true);
      router.replace(targetRoute as any);
    } else if (isRouting) {
      // If we were routing and we are now on target (or no target is needed), finish routing
      if (!targetRoute || normalizedTarget === normalizedPathname) {
        setIsRouting(false);
        routingRef.current = false;
      }
    }
  }, [isAuthenticated, hasFinishedOnboarding, isHydrated, isInitialized, segments, pathname, videoFinished]);

  const handleVideoFinish = React.useCallback(() => {
    console.log('[RootLayout] handleVideoFinish called. Setting videoFinished=true');
    setVideoFinished(true);
  }, []);

  // Safety fallback: If we are stuck in isRouting for too long, force it to false
  useEffect(() => {
    if (isRouting) {
      const timer = setTimeout(() => {
        console.warn('[RootLayout] Safety timeout triggered: clearing isRouting hang');
        setIsRouting(false);
        routingRef.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isRouting]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider
          publishableKey="pk_live_51R15MnK5fB5lGbp8VegFwbWvCmKN976QtqCHDmpXND8fNsmtwiPaBXPHaiV135A8nbCK1y7LEnvqACH7hClCT19l005y1ZoRmZ"
          merchantIdentifier="merchant.com.hipster">
          {isInitialized ? (
            <Stack
              screenOptions={{ headerShown: false }}>
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(drawer)" />
              <Stack.Screen name="(guided)" />
            </Stack>
          ) : <View style={{ flex: 1, backgroundColor: '#000000' }} />}

          <StyledStatusBar theme="dark" translucent={true} />

          <>
            {(!isHydrated || !isInitialized || !videoFinished || isRouting) && (
              <WelcomeScreen 
                onVideoFinish={handleVideoFinish} 
                setIsRouting={setIsRouting}
              />
            )}
          </>
        </StripeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

