// Unified Blue Color Scheme - Based on #203c8e
// Removing all other colors (Violet, Cyan, Pink) for a focused brand identity.

const blue = {
  50: '#f0f3ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#2c469b', // Softer primary blue
  800: '#1e1b4b',
  900: '#0f172a',
  950: '#020617',
};

export const colors = {
  blue, // Expose full scale for direct use if needed
  
  // Background Colors
  background: {
    primary: '#000000',      // Pure black
    secondary: blue[900],    // Dark blue
    tertiary: blue[800],     // Deep blue
    premium: blue[950],      // Deepest midnight blue
    dark: blue[950],         // Default dark background
  },

  // Primary Theme Colors (Unifying everything to blue)
  primary: {
    main: blue[700],
    light: blue[400],
    dark: blue[900],
    glow: blue[700],
  },

  // Neon style mapping
  neon: {
    primary: blue[700],
    accent: blue[400],
  },

  // Text Colors
  text: {
    primary: '#d1d5db',      // Softer light gray instead of bright white
    secondary: '#94a3b8',    // Muted slate gray for secondary text
    muted: '#64748b',        // Muted slate for less important text
    accent: '#60a5fa',       // Accent blue for highlights
  },

  // Gradient Colors
  gradient: {
    primary: [blue[600], blue[800]] as const,      // Blue theme gradient
    hero: ['#FFFFFF', '#F5F5F5'] as const,
    glass: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
    card: [blue[900], blue[950]] as const,
    dark: ['#141414', '#0A0A0A'] as const,
    premiumButton: [blue[700], 'rgba(44, 67, 134, 0.2)'] as const, // The glassy #203c8e mix
  },

  // Status Colors (Kept for functional UI but aligned if possible)
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: blue[600],
  },

  // Border & Overlay
  border: blue[800],         // Dark themed border
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Glass-morphism effect
export const glass = {
  background: 'rgba(30, 41, 59, 0.6)', // Slate-800 based opacity
  border: 'rgba(255, 255, 255, 0.1)',
};
