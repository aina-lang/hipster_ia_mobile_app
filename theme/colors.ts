// ══════════════════════════════════════════════════════════════
// HIPSTER IA — Neon Dark Theme
// Deep black backgrounds + Tailwind Blue neon primary + Electric accents
// ══════════════════════════════════════════════════════════════

// Tailwind CSS exact blue scale
const blue = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa', // ← Tailwind blue-400  (neon glow)
  500: '#3b82f6', // ← Tailwind blue-500  (primary CTA)
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

// Electric violet for secondary highlights
const violet = {
  400: '#a78bfa', // violet-400
  500: '#8b5cf6', // violet-500
  600: '#7c3aed',
  700: '#6d28d9',
};

// Neon pink / rose for alerts & destructive
const rose = {
  400: '#fb7185', // rose-400
  500: '#f43f5e', // rose-500
};

export const colors = {
  blue,
  violet,
  rose,

  // Background — pure deep black
  background: {
    primary: '#050508',
    secondary: '#09090f',
    tertiary: '#0e0e18',
    premium: '#030308',
    dark: '#030308',
  },

  // Primary — Tailwind Blue 500 with neon glow from 400
  primary: {
    main: blue[500], // #3b82f6 — vibrant neon blue
    light: blue[400], // #60a5fa — glow / hover
    dark: blue[700], // for dark accents
    glow: blue[400], // used for shadow / glow effects
  },

  // Neon accents
  neon: {
    primary: blue[500], // main neon blue
    accent: violet[500], // electric violet secondary
    pink: rose[500], // neon rose for alerts
  },

  // Text — soft off-white, easy on the eyes against deep black
  text: {
    primary: '#e2e8f0', // slate-200 — slightly warm, NOT pure white
    secondary: '#8892a4', // muted blue-gray
    muted: '#4b5568', // darker secondary
    accent: blue[400], // neon blue for links / highlights
  },

  // Gradients
  gradient: {
    primary: [blue[600], violet[600]] as const, // blue → violet
    hero: ['#e2e8f0', '#c0c8d8'] as const,
    glass: ['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.06)'] as const,
    card: ['rgba(9, 9, 15, 0.95)', 'rgba(5, 5, 8, 0.98)'] as const,
    dark: ['#09090f', '#050508'] as const,
    premiumButton: [blue[500], violet[500]] as const, // blue → violet CTA
  },

  // Status Colors
  status: {
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: rose[500], // neon rose
    info: blue[400],
  },

  // Border & Overlay — subtle neon blue glow
  border: 'rgba(59, 130, 246, 0.18)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

// Glass-morphism — dark tinted with neon blue micro-tint
export const glass = {
  background: 'rgba(59, 130, 246, 0.05)',
  border: 'rgba(59, 130, 246, 0.18)',
};
