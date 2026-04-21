import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname, SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useAuthStore } from '../store/authStore';
import { useWelcomeVideoStore } from '../store/welcomeVideoStore';
import '../global.css';
import { StripeProvider } from '@stripe/stripe-react-native';
import WelcomeScreen from './welcome';
import { StyledStatusBar } from '../components/ui/StyledStatusBar';
import { TimeDynamicMessageModal } from '../components/TimeDynamicMessageModal';
import { GenericModal } from '../components/ui/GenericModal';
import * as Notifications from 'expo-notifications';
import * as Network from 'expo-network';
import { View, Platform, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useAppInitialization } from '../hooks/useAppInitialization';
import { useNetworkStore } from '../store/networkStore';

SplashScreen.preventAutoHideAsync();

/** Failsafe so a hung session check cannot block the app forever (splash / Stack). */
const AUTH_INIT_TIMEOUT_MS = 5_000;

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
  /^\/(welcome|login|register|verify-email|verify-otp|forgot-password|reset-password|privacy-policy|packs|job|branding|setup|payment)(\/|$)/i;

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
  const { user, isAuthenticated, hasFinishedOnboarding, isHydrated } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const { videoCompleted, setVideoCompleted } = useWelcomeVideoStore();
  const { isConnected, setConnected } = useNetworkStore();
  const [showOfflineModal, setShowOfflineModal] = React.useState(false);

  const { isReady, isInitialized, fontsLoaded } = useAppInitialization();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Poll network connectivity every 5 seconds
  useEffect(() => {
    const checkAndUpdate = async () => {
      const state = await Network.getNetworkStateAsync();
      const connected = !!(state.isConnected && state.isInternetReachable);
      const wasConnected = useNetworkStore.getState().isConnected;
      setConnected(connected);
      // Show modal when connection is lost
      if (!connected && wasConnected) {
        setShowOfflineModal(true);
      }
      // Auto-dismiss when connection is restored
      if (connected && !wasConnected) {
        setShowOfflineModal(false);
      }
    };
    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 5000);
    return () => clearInterval(interval);
  }, [setConnected]);

  // On app startup, auth logic and permissions are now handled inside useAppInitialization.

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
    const printDebug = () => {
      console.log('[RootLayout] Current state:', {
        pathname,
        segments,
        isAuthenticated,
        isHydrated,
        isInitialized,
        hasFinishedOnboarding,
      });
    };
    const timer = setInterval(printDebug, 2000);
    return () => clearInterval(timer);
  }, [pathname, segments, isAuthenticated, isHydrated, isInitialized, hasFinishedOnboarding]);

  // Check if we are in specific groups/pages
  const inAuthGroup = segments.some(s => s.includes('(auth)')) || segments.includes('login') || segments.includes('register') || segments.includes('verify-email');
  const inOnboardingGroup = segments.some(s => s.includes('(onboarding)')) || segments.includes('setup') || segments.includes('branding') || segments.includes('packs') || segments.includes('payment');
  const inGuidedGroup = segments.some(s => s.includes('(guided)'));
  const inDrawerGroup = segments.some(s => s.includes('(drawer)'));
  const inTabsGroup   = segments.some(s => s.includes('(tabs)'));
  const pathInPublicUnauthFlow = pathLooksLikePublicUnauthFlow(pathname);
  const inUnauthPublicFlow = inAuthGroup || inOnboardingGroup || pathInPublicUnauthFlow;

  useEffect(() => {
    if (!isReady) {
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
      // 1. Check for plan expiration
      const now = new Date();
      const isExpired = user?.subscriptionEndDate && new Date(user.subscriptionEndDate) < now;

      if (isExpired && !segments.includes('packs')) {
        console.log('[RootLayout] Plan expired, forcing redirect to packs');
        targetRoute = '/(onboarding)/packs';
      }
      else if (user && !user.isEmailVerified) {
        if (!segments.includes('verify-email')) {
          targetRoute = '/(auth)/verify-email';
        }
      }
      // For AI users, require payment unless they already have an active plan (even without Stripe)
      else if (user && user.type === 'ai' && !user.stripeSubscriptionId) {
        const hasActivePlan = 
          (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing' || user.subscriptionStatus === 'trial') &&
          user.planType && user.planType !== 'curieux';
        if (!hasActivePlan && !segments.includes('packs')) {
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
      else {
        // User is fully set up. Ensure they are in a protected group,
        // otherwise default to (drawer) home.
        if (!inDrawerGroup && !inGuidedGroup && !inTabsGroup) {
          targetRoute = '/(drawer)';
        }
      }
    } else {
      // If not authenticated, allow access to (auth) and (onboarding)
      // Only redirect to /welcome if in protected area
      const inProtectedRoute = inDrawerGroup || inGuidedGroup || inTabsGroup;
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
      try {
        console.log('[RootLayout] About to call router.replace');
        router.replace(targetRoute as any);
        console.log('[RootLayout] router.replace called successfully');
      } catch (error) {
        console.error('[RootLayout] ERROR during router.replace:', error);
      }
    }
  }, [isAuthenticated, hasFinishedOnboarding, isReady, segments, pathname, inUnauthPublicFlow, user, inDrawerGroup, inGuidedGroup, inTabsGroup]);

  const handleVideoFinish = React.useCallback(() => {
    console.log('[RootLayout] handleVideoFinish called. Setting videoCompleted=true');
    setVideoCompleted(true);
  }, [setVideoCompleted]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StripeProvider
            publishableKey="pk_test_51R15MnK5fB5lGbp8C5QAYcALGWTBBmTmYxsnMnigeUNUg2DvsR9u4xbsF1GNzDIqiQxFqz9Dg10kEttfcpbr5DVX00yGKXocyS"
            merchantIdentifier="merchant.com.hipster">
            <>
              {(isAuthenticated || inUnauthPublicFlow) ? (
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

              {/* 🎯 Time-based dynamic pop-up messages */}
              <TimeDynamicMessageModal />

              {!isAuthenticated &&
                !inUnauthPublicFlow &&
                !videoCompleted && (
                  <WelcomeScreen onVideoFinish={handleVideoFinish} />
                )}

              {/* 🌐 Global no-connection modal */}
              <GenericModal
                visible={showOfflineModal}
                type="warning"
                title="Pas de connexion"
                message="Vérifiez votre connexion internet et réessayez."
                confirmText="Réessayer"
                onConfirm={async () => {
                  const connected = await useNetworkStore.getState().checkConnectivity();
                  if (connected) setShowOfflineModal(false);
                }}
                onClose={() => setShowOfflineModal(false)}
              />
            </>
          </StripeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
