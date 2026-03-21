import { useWindowDimensions } from 'react-native';

interface ResponsiveDimensions {
  // Font sizes
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  
  // Spacing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  
  // Component specific
  topBarHeight: number;
  mainSubTextBottom: number;
  containerBottom: number;
  particleBottom: number;
  containerPaddingHorizontal: number;
  containerGap: number;
  
  // Device info
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isTablet: boolean;
  isLandscape: boolean;
}

export const useResponsiveDimensions = (): ResponsiveDimensions => {
  const { width, height } = useWindowDimensions();
  
  // Device size detection
  const isSmallScreen = width < 400;
  const isMediumScreen = width >= 400 && width < 600;
  const isLargeScreen = width >= 600 && width < 900;
  const isTablet = width >= 900;
  const isLandscape = height < width;
  
  // Adaptive font sizes
  const fontSize = {
    xs: isSmallScreen ? 10 : isMediumScreen ? 11 : 12,
    sm: isSmallScreen ? 12 : isMediumScreen ? 13 : 14,
    base: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
    lg: isSmallScreen ? 16 : isMediumScreen ? 17 : 18,
    xl: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
    '2xl': isSmallScreen ? 24 : isMediumScreen ? 26 : 28,
    '3xl': isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
  };
  
  // Adaptive spacing
  const spacing = {
    xs: isSmallScreen ? 4 : 6,
    sm: isSmallScreen ? 8 : 10,
    md: isSmallScreen ? 12 : 16,
    lg: isSmallScreen ? 16 : 20,
    xl: isSmallScreen ? 20 : 24,
    '2xl': isSmallScreen ? 24 : 32,
  };
  
  // Component-specific responsive values
  const topBarHeight = isSmallScreen 
    ? (isLandscape ? 40 : 110)
    : isMediumScreen
    ? (isLandscape ? 50 : 120)
    : (isLandscape ? 60 : 140);
  
  const mainSubTextBottom = isSmallScreen 
    ? (isLandscape ? -280 : -420)
    : isMediumScreen
    ? (isLandscape ? -320 : -480)
    : (isLandscape ? -360 : -540);
  
  const containerBottom = isSmallScreen 
    ? (isLandscape ? 20 : 50)
    : isMediumScreen
    ? (isLandscape ? 30 : 65)
    : (isLandscape ? 40 : 80);
  
  const particleBottom = isSmallScreen 
    ? (isLandscape ? 80 : 150)
    : isMediumScreen
    ? (isLandscape ? 100 : 180)
    : (isLandscape ? 120 : 200);
  
  const containerPaddingHorizontal = isSmallScreen ? 16 : isMediumScreen ? 20 : 24;
  const containerGap = isSmallScreen ? 10 : 12;
  
  return {
    fontSize,
    spacing,
    topBarHeight,
    mainSubTextBottom,
    containerBottom,
    particleBottom,
    containerPaddingHorizontal,
    containerGap,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTablet,
    isLandscape,
  };
};
