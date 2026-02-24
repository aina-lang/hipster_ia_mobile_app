import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SplashParticles } from '../components/SplashParticles';
import { colors } from '../theme/colors';

export default function Index() {
  return (
    <LinearGradient
      colors={['#0a0e27', '#1a1f3a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SplashParticles />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Logo ou autre contenu ici si tu veux */}
      </View>
    </LinearGradient>
  );
}
