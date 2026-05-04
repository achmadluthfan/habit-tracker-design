// Theme tokens — shared across all components
const THEME = {
  colors: {
    bg: '#f7f3ee',
    bgCard: '#fffcf8',
    bgMuted: '#f0ebe3',
    border: '#e8e0d4',
    borderStrong: '#d4c9b8',
    text: '#2d2520',
    textMid: '#6b5e52',
    textMuted: '#9e8e80',
    accent: '#e8825a',
    accentLight: '#fae8df',
    gold: '#c9a96e',
    goldLight: '#f5eddb',
    green: '#4caf7d',
    greenLight: '#dff4eb',
    blue: '#6b9fd4',
    blueLight: '#deeaf7',
    purple: '#9b7fd4',
    purpleLight: '#ede5f7',
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 3px rgba(45,37,32,0.06)',
    md: '0 4px 16px rgba(45,37,32,0.08)',
    lg: '0 8px 32px rgba(45,37,32,0.10)',
  },
  font: {
    sans: "'DM Sans', sans-serif",
    mono: "'DM Mono', monospace",
  }
};

Object.assign(window, { THEME });
