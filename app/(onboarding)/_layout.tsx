import { Stack } from 'expo-router';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { colors } from '../../theme/colors';
import '../../global.css';

export default function OnboardingLayout() {
  return (
    <ImageBackground
      source={require('../../assets/bg.jpg')}
      style={styles.container}
      resizeMode="cover">
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Subtle dark overlay to ensure text readability
  },
});
