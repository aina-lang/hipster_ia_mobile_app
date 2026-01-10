import { Stack, useRouter, useSegments } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { StepIndicator } from '../../components/ui/StepIndicator'; // Reuse existing component or create new
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuidedLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Determine current step based on route name
  const currentRoute = segments[segments.length - 1];
  let currentStep = 1;
  if (currentRoute === 'step1-job') currentStep = 1;
  else if (currentRoute === 'step2-type') currentStep = 2;
  else if (currentRoute === 'step3-context') currentStep = 3;
  else if (currentRoute === 'step4-create') currentStep = 4;
  else if (currentRoute === 'step5-result') currentStep = 5;

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          header: () => (
            <SafeAreaView edges={['top']} style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <ArrowLeft size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.indicatorContainer}>
                  <StepIndicator currentStep={currentStep} totalSteps={5} />
                </View>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>
          ),
          contentStyle: { backgroundColor: colors.background.dark },
        }}>
        <Stack.Screen name="step1-job" />
        <Stack.Screen name="step2-type" />
        <Stack.Screen name="step3-context" />
        <Stack.Screen name="step4-create" />
        <Stack.Screen name="step5-result" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  indicatorContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
