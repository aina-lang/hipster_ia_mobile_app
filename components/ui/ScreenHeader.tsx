import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NeonBackButton } from './NeonBackButton';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface ScreenHeaderProps {
  titleSub: string;
  titleScript: string;
  onBack: () => void;
}

export function ScreenHeader({ titleSub, titleScript, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        s.header,
        { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 50 : 40) },
      ]}
    >
      <NeonBackButton onPress={onBack} />
      <View style={s.center}>
        <View style={s.titleRow}>
          <Text style={s.titleSub}>{titleSub}</Text>
          <Text style={s.titleScript}>{titleScript}</Text>
        </View>
      </View>
      <View style={s.spacer} />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: colors.midnightBlue,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSlateBlue,
    zIndex: 100,
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
  spacer: {
    width: 42,
  },
});