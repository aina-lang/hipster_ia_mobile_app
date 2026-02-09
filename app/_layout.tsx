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

export default function RootLayout() {
  const { user, isAuthenticated, hasFinishedOnboarding, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    const timeout = setTimeout(() => {
      const inAuthGroup = segments.some(s => s.includes('(auth)')) || segments.includes('login') || segments.includes('register') || segments.includes('verify-email');
      const inOnboardingGroup = segments.some(s => s.includes('(onboarding)')) || segments.includes('setup') || segments.includes('branding') || segments.includes('packs') || segments.includes('welcome') || segments.includes('payment');
      let targetRoute: string | null = null;

      if (isAuthenticated) {
        // Redirection based on onboarding and subscription status
        const planType = user?.aiProfile?.planType;
        const subStatus = user?.aiProfile?.subscriptionStatus;
        const isPaidPlan = planType && planType !== 'curieux';
        const isSubscriptionActive = subStatus === 'active';
        const isPaidPlanButInactive = isPaidPlan && !isSubscriptionActive;

        if (!hasFinishedOnboarding) {
          if (!inOnboardingGroup) {
            targetRoute = '/(onboarding)/setup';
          }
        } else {
          // If onboarding finished (regardless of plan/subscription status)
          if (inAuthGroup || inOnboardingGroup || !segments[0]) {
            targetRoute = '/(drawer)';
          }
        }
      } else {
        // If not authenticated
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
          publishableKey="pk_test_51SwUCtIBocWEq1MHOai63QOvSnEtYMU7kdDQUyo81zNt1XBYINS07FGgboCZnhTawtSu9nAu9F4uGgUo538aKnCN007HrfkxE0"
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
