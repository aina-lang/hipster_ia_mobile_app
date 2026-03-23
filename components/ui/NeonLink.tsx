import React from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface NeonLinkProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<TextStyle>;
}

export function NeonLink({ label, onPress, style }: NeonLinkProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.link, style]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  link: {
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    color: 'white',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});