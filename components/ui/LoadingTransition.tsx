import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { BackgroundGradient } from './BackgroundGradient';
import { DeerAnimation } from './DeerAnimation';
import { colors } from '../../theme/colors';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const LoadingTransition = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={StyleSheet.absoluteFill}>
      <BackgroundGradient>
        <View style={styles.container}>
          <DeerAnimation size={200} progress={0} />
          <View style={styles.content}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.text}>Hipster•IA est en route...</Text>
          </View>
        </View>
      </BackgroundGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    opacity: 0.8,
  },
});
