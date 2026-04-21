import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as SystemUI from 'expo-system-ui';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';

const AUTH_INIT_TIMEOUT_MS = 5_000;

export function useAppInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isHydrated, initializeAuth } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    'Arimo-Regular': require('../assets/fonts/Arimo/Arimo-Regular.ttf'),
    'Arimo-Bold': require('../assets/fonts/Arimo/Arimo-Bold.ttf'),
    'Brittany-Signature': require('../assets/fonts/Brittany/BrittanySignature.ttf')
  });

  useEffect(() => {
    // Prevent white flash during initial loads
    SystemUI.setBackgroundColorAsync('#000000').catch(() => { });
  }, []);

  useEffect(() => {
    // Only proceed once Zustand has finished hydrating from AsyncStorage
    if (!isHydrated) {
      return;
    }

    let cancelled = false;

    const prepareApp = async () => {
      try {
        // 1. Request hardware and system permissions asynchronously
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
            console.warn('[useAppInitialization] Initial permission request failed:', e);
          }
        };

        // Run permission requests without blocking auth init
        requestPermissions();

        // 2. Check internet connectivity first
        const isConnected = await useNetworkStore.getState().checkConnectivity();

        // 3. Only try to verify session if we actually have internet
        if (isConnected) {
          await Promise.race([
            initializeAuth(),
            new Promise<void>((_, reject) =>
              setTimeout(
                () => reject(new Error('[useAppInitialization] initializeAuth timed out')),
                AUTH_INIT_TIMEOUT_MS
              )
            ),
          ]);
        } else {
          console.warn('[useAppInitialization] No internet connection — skipping auth init.');
        }

      } catch (error: any) {
        if (error?.message?.includes('timed out')) {
          console.warn('[useAppInitialization] Auth init timed out; unlocking UI anyway.');
        } else {
          console.error('[useAppInitialization] Initialization error:', error);
        }
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    };

    prepareApp();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, initializeAuth]);

  // The app is completely ready when custom fonts are loaded, 
  // store is hydrated, and asynchronous initialization is complete.
  const isReady = isInitialized && (fontsLoaded || fontError != null);

  return { isReady, isInitialized, fontsLoaded };
}
