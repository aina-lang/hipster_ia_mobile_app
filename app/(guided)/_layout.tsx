import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function GuidedLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.dark },
        }}>
        <Stack.Screen name="step1-job" />
        <Stack.Screen name="step2-type" />
        <Stack.Screen name="step3-personalize" />
        <Stack.Screen name="step4-result" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
});
