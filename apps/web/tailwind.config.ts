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
          'bg-alt': '#080810',
          surface: '#12121a',
          'surface-hover': '#1a1a28',
          border: '#1e1e2e',
          'border-bright': '#2a2a40',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          'accent-muted': '#6366f120',
          'accent-glow': '#6366f140',
          text: '#e2e8f0',
          'text-bright': '#f8fafc',
          muted: '#64748b',
          'muted-light': '#94a3b8',
          green: '#22c55e',
          'green-muted': '#22c55e20',
          red: '#ef4444',
          'red-muted': '#ef444420',
          yellow: '#eab308',
          'yellow-muted': '#eab30820',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.15)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.2)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.25)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.2)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-accent-hover': 'linear-gradient(135deg, #818cf8, #a78bfa)',
        'gradient-surface': 'linear-gradient(180deg, rgba(99, 102, 241, 0.05), transparent)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
