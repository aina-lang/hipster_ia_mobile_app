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
  
  // BrittanySignature
  signature: {
    fontFamily: fonts.brittany.regular,
    fontSize: 24,
    color: '#ffffff',
  },
});

export const createColoredText = (baseStyle: any, color: string) => ({
  ...baseStyle,
  color,
});