import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { StepIndicator } from '../ui/StepIndicator';
import { useCreationStore } from '../../store/creationStore';
import { BackgroundGradientOnboarding } from 'components/ui/BackgroundGradientOnboarding';

interface GuidedScreenWrapperProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function GuidedScreenWrapper({
  children,
  headerRight,
  onBack,
  footer,
  scrollViewRef,
}: GuidedScreenWrapperProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const currentRoute = segments[segments.length - 1];
  const totalSteps = 3;

  let currentStep = 1;
  if (currentRoute === 'step1-job') currentStep = 1;
  else if (currentRoute === 'step2-type') currentStep = 2;
  else if (currentRoute === 'step3-personalize') currentStep = 3;
  else if (currentRoute === 'step4-result') currentStep = 3;


  const darkOverlay = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ['rgba(13, 13, 13, 0)', 'rgba(13, 13, 13, 1)'],
    extrapolate: 'clamp',
  });

  return (
    <BackgroundGradientOnboarding blurIntensity={80} darkOverlay={true}>
      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            {
              paddingTop: insets.top - 15,
            },
          ]}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: darkOverlay,
              },
            ]}
          />


          <View
            style={styles.headerContent}
            className="flex flex-row items-center justify-between px-5"
          >
            <TouchableOpacity
              onPress={onBack || (() => router.back())}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View className="-top-2 h-full pt-0">
              <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
            </View>

            {headerRight ? (
              <View style={styles.headerRight}>{headerRight}</View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        </Animated.View>

        {/* CONTENT */}
        {footer ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <Animated.ScrollView
              ref={scrollViewRef as any}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingTop: insets.top + 150,
                paddingBottom: insets.bottom + 20,
              }}
            >
              {children}
            </Animated.ScrollView>
            {footer}
          </KeyboardAvoidingView>
        ) : (
          <Animated.ScrollView
            ref={scrollViewRef as any}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: insets.top + 150,
              paddingBottom: insets.bottom + 20,
            }}
          >
            {children}
          </Animated.ScrollView>
        )}
      </View>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {},
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});