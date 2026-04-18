import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { NeonBackButton } from './NeonBackButton';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface ScreenHeaderProps {
  titleSub: string;
  titleScript: string;
  onBack?: () => void;
  scrollY?: SharedValue<number>;
  renderRight?: () => React.ReactNode;
}

export function ScreenHeader({ titleSub, titleScript, onBack, scrollY, renderRight }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY 
      ? interpolate(scrollY.value, [0, 50], [0, 0.95], Extrapolate.CLAMP)
      : 0.95;
    
    const borderOpacity = scrollY
      ? interpolate(scrollY.value, [0, 50], [0, 0.08], Extrapolate.CLAMP)
      : 0.08;

    return {
      backgroundColor: `rgba(3, 8, 20, ${opacity})`,
      borderBottomColor: `rgba(255, 255, 255, ${borderOpacity})`,
    };
  });

  return (
    <Animated.View
      style={[ { paddingTop: insets.top + (Platform.OS === 'ios' ? 50 : 60) },
   
        s.header,
        { paddingTop: insets.top + (Platform.OS === 'ios' ? 40 : 50) },
        animatedStyle,
      ]}
    >
      <View style={s.backButtonContainer}>
        {onBack ? (
          <NeonBackButton onPress={onBack} />
        ) : (
          <View style={s.spacer} />
        )}
      </View>
      <View style={s.center}>
        <View style={s.titleRow}>
          <Text style={s.titleSub}>{titleSub}</Text>
          <Text style={s.titleScript}>{titleScript}</Text>
        </View>
      </View>
      <View style={s.rightActionContainer}>
        {renderRight ? renderRight() : <View style={s.spacer} />}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  header: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    zIndex: 100,
  },
  backButtonContainer: {
    // This empty view or container helps align with GuidedScreenWrapper
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  titleSub: {
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.gray,
    lineHeight: 22,
  },
  titleScript: {
    fontFamily: fonts.brittany,
    paddingLeft: 1,
    fontSize: 28,
    color: 'white',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    paddingBottom : 10
  },
  rightActionContainer: {
    width: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  spacer: {
    width: 42,
  },
});