// Pure Black & White Theme — No colors besides #000000 / #FFFFFF and grayscale

const bw = {
  white: '#efefef',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  gray950: '#0A0A0A',
};

export const colors = {
  // Expose scale
  bw,

  // Background Colors
  background: {
    primary: bw.black,
    secondary: bw.gray900,
    tertiary: bw.gray800,
    premium: bw.gray950,
    dark: bw.gray950,
  },

  // Primary Theme Colors
  primary: {
    main: bw.white,
    light: bw.gray200,
    dark: bw.gray900,
    glow: bw.white,
  },

  // Neon style (converted to BW palette)
  neon: {
    primary: bw.white,
    accent: bw.gray300,
  },

  // Text Colors
  text: {
    primary: bw.white,
    secondary: bw.gray400,
    muted: bw.gray500,
    accent: bw.white,
  },

  // Gradient Colors
  gradient: {
    primary: [bw.gray700, bw.gray900] as const,
    hero: [bw.white, bw.gray100] as const,
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'] as const,
    card: [bw.gray900, bw.gray950] as const,
    dark: [bw.gray800, bw.gray900] as const,
    premiumButton: [bw.white, 'rgba(255, 255, 255, 0.2)'] as const,
  },

  // Status Colors (functional UI — converted to grayscale equivalents)
  status: {
    success: bw.gray300,
    warning: bw.gray400,
    error: bw.gray500,
    info: bw.gray600,
  },

  // Border & Overlay
  border: bw.gray700,
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Glass-morphism effect
export const glass = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.2)',
};