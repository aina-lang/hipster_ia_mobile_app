import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../ui/BackgroundGradient';
import { StepIndicator } from '../ui/StepIndicator';
import { useCreationStore } from '../../store/creationStore';
import { WORKFLOWS } from '../../constants/workflows';

interface GuidedScreenWrapperProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function GuidedScreenWrapper({ children, headerRight }: GuidedScreenWrapperProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const { selectedJob, selectedFunction } = useCreationStore();

  // Determine if Step 3 (Context/Personalization) is part of the flow
  const hasStep3 =
    selectedJob && selectedFunction && WORKFLOWS[selectedJob]?.[selectedFunction]?.length > 0;

  // Determine current step and total steps based on route and workflow
  const currentRoute = segments[segments.length - 1];
  const totalSteps = hasStep3 ? 5 : 4;

  let currentStep = 1;
  if (currentRoute === 'step1-job') {
    currentStep = 1;
  } else if (currentRoute === 'step2-type') {
    currentStep = 2;
  } else if (currentRoute === 'step3-context') {
    currentStep = 3;
  } else if (currentRoute === 'step4-create') {
    currentStep = hasStep3 ? 4 : 3;
  } else if (currentRoute === 'step5-result') {
    currentStep = hasStep3 ? 5 : 4;
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.95], // Fades to 95% opacity
    extrapolate: 'clamp',
  });

  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ['transparent', colors.background.dark],
    extrapolate: 'clamp',
  });

  return (
    <BackgroundGradient>
      <View style={{ flex: 1 }}>
        {/* Absolute Header */}
        <Animated.View
          style={[
            styles.header,
            {
              paddingTop: insets.top - 15,
              backgroundColor: headerBackgroundColor,
              borderBottomWidth: 1,
              borderBottomColor: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: ['transparent', 'rgba(255,255,255,0.05)'],
                extrapolate: 'clamp',
              }),
            },
          ]}>
          <View
            style={styles.headerContent}
            className="flex flex-row items-center justify-between px-5 ">
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View className="-top-2  h-full pt-0">
              <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
            </View>

            {headerRight ? (
              <View style={styles.headerRight}>{headerRight}</View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        </Animated.View>

        {/* contentContainerStyle needs paddingBottom for safe area and paddingTop for header space */}
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false } // backgroundColor interpolation requires false
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: insets.top + 150, // Space for the header
            paddingBottom: insets.bottom + 20,
          }}>
          {children}
        </Animated.ScrollView>
      </View>
    </BackgroundGradient>
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  indicatorContainer: {
    backgroundColor: 'red',
  },
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
