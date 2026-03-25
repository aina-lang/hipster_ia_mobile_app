import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface NeonActionButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled: boolean;
  label: string;
  icon?: React.ReactNode;
  small?: boolean;
  align?: 'center' | 'left';
}

export function NeonActionButton({ onPress, loading, disabled, label, icon, small, align = 'center' }: NeonActionButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (v: number, speed: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed }).start();

  return (
    <Animated.View style={[s.btnWrapper, small && (align === 'left' ? s.wrapperSmallLeft : s.wrapperSmall), { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => spring(0.96, 40)}
        onPressOut={() => spring(1, 20)}
        disabled={disabled}
        style={s.btnPressable}
      >
        <LinearGradient
          colors={['#264F8C', '#0a1628', '#040612']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.46, 1]}
          style={s.btnGradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {icon}
              <Text style={s.btnText}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btnWrapper: {
    alignSelf: 'center',
    width: '70%',
  },
  wrapperSmall: {
    width: '70%',
    alignSelf: 'center',
  },
  wrapperSmallLeft: {
    width: '70%',
    alignSelf: 'flex-start',
  },
  btnPressable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  btnGradient: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#fff',
  },
});
