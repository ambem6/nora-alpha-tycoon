export const THEME = {
  colors: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    border: '#333333',
    primary: '#00ffcc',
    primaryDim: 'rgba(0, 255, 204, 0.1)',
    secondary: '#a020f0',
    text: { main: '#ffffff', muted: '#888888', danger: '#ff4444' }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    size: { xs: '0.7rem', sm: '0.8rem', md: '1rem', lg: '1.2rem', xl: '1.5rem' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  borderRadius: { sm: '4px', md: '8px', round: '50%' }
} as const;
