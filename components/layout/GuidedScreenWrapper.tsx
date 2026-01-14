import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../ui/BackgroundGradient';
import { StepIndicator } from '../ui/StepIndicator';

interface GuidedScreenWrapperProps {
  children: React.ReactNode;
}

export function GuidedScreenWrapper({ children }: GuidedScreenWrapperProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Determine current step based on route name
  const currentRoute = segments[segments.length - 1];
  let currentStep = 1;
  if (currentRoute === 'step1-job') currentStep = 1;
  else if (currentRoute === 'step2-type') currentStep = 2;
  else if (currentRoute === 'step3-context') currentStep = 3;
  else if (currentRoute === 'step4-create') currentStep = 4;
  else if (currentRoute === 'step5-result') currentStep = 5;

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
              paddingTop: insets.top -15, 
              backgroundColor: headerBackgroundColor,
              borderBottomWidth: 1,
              borderBottomColor: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: ['transparent', 'rgba(255,255,255,0.05)'],
                extrapolate: 'clamp',
              }),
            },
          ]}>
          <View style={styles.headerContent} className='flex flex-row items-center justify-between px-5 '>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <View className='h-full  pt-0 -top-2'>
              <StepIndicator currentStep={currentStep} totalSteps={5} />
            </View>

            {/* Spacer to balance the back button */}
            <View style={{ width: 40 }} />
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
  headerContent: {
   
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  indicatorContainer: {
    backgroundColor:"red",

    
  },
});
