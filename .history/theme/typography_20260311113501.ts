// theme/typography.ts
import { StyleSheet } from 'react-native';

export const fonts = {
  arimo: {
    regular: 'Arimo-Regular',
    bold: 'Arimo-Bold',
  },
  brittany: {
    regular: 'Brittany-Regular',
  },
};

export const textStyles = StyleSheet.create({
  // Arimo
  body: {
    fontFamily: fonts.arimo.regular,
    fontSize: 16,
    color: '#ffffff',
  },
  bodyBold: {
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  h1: {
    fontFamily: fonts.arimo.bold,
    fontSize: 28,
    color: '#ffffff',
  },
  h2: {
    fontFamily: fonts.arimo.bold,
    fontSize: 22,
    color: '#ffffff',
  },
  
  // Brittany (pour les titres élégants)
  signature: {
    fontFamily: fonts.brittany.regular,
    fontSize: 24,
    color: '#00d4ff',
  },
  elegantTitle: {
    fontFamily: fonts.brittany.regular,
    fontSize: 32,
    color: '#ffffff',
  },
});

// Pour les couleurs, tu peux les passer en props
export const createColoredText = (baseStyle: any, color: string) => ({
  ...baseStyle,
  color,
});