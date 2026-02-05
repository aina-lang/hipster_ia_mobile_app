import { Stack } from 'expo-router';
import { View, StyleSheet, ImageBackground } from 'react-native';
import '../../global.css';

export default function AuthLayout() {

 return (
    <View
      style={styles.container}
   >
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#11111a"
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});

