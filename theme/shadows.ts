import { ViewStyle } from 'react-native';

// Shadow styles for glow effects
// Note: React Native has limited shadow support, we use multiple properties

export const shadows = {
  // Neon glow effect (combination of shadow and border styling)
  neonGlow: {
    shadowColor: '#2c469b', // Softer primary blue glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, // Lowered opacity
    shadowRadius: 15,
    elevation: 8, // Lowered elevation
  } as ViewStyle,

  // Soft glow
  softGlow: {
    shadowColor: '#2c469b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  } as ViewStyle,

  // Card shadow
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  // Subtle shadow
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
};
