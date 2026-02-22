import React from 'react';
import { StatusBar as ExpoStatusBar, StatusBarStyle } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export type StatusBarTheme = 'light' | 'dark' | 'auto';

interface StyledStatusBarProps {
  theme?: StatusBarTheme;
  translucent?: boolean;
}

export function StyledStatusBar({ theme = 'light', translucent = true }: StyledStatusBarProps) {
  const colorScheme = useColorScheme();

  // Determine the actual style based on theme preference
  const getStatusBarStyle = (): StatusBarStyle => {
    if (theme === 'auto') {
      return colorScheme === 'dark' ? 'light' : 'dark';
    }
    return theme as StatusBarStyle;
  };

  return (
    <ExpoStatusBar
      style={getStatusBarStyle()}
      translucent={translucent}
      backgroundColor="transparent"
    />
  );
}
