import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#0a0a0f',
          surface: '#12121a',
          border: '#1e1e2e',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          text: '#e2e8f0',
          muted: '#64748b',
          green: '#22c55e',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};

export default config;
