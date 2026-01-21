import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // TerraGroup Labs - Dark Theme
        labs: {
          black: '#0a0a0f',
          dark: '#12141a',
          steel: '#1a1d24',
          terminal: '#2a2d35',
        },
        // Alert colors
        alert: {
          red: '#dc2626',
          neon: '#ff3b3b',
          orange: '#f97316',
          yellow: '#eab308',
        },
        // Tactical colors
        tactical: {
          cyan: '#06b6d4',
          green: '#22c55e',
          purple: '#a855f7',
          blue: '#2563eb',
        },
        // Light theme - Field Operations
        field: {
          white: '#fafafa',
          cream: '#f5f5f4',
          gray: '#e7e5e4',
          border: '#d6d3d1',
        },
        // Combat colors (light theme accents)
        combat: {
          red: '#b91c1c',
          orange: '#c2410c',
          yellow: '#a16207',
        },
        // Intel colors (light theme secondary)
        intel: {
          cyan: '#0891b2',
          green: '#15803d',
          purple: '#7c3aed',
        },
        // Stone colors for light theme text
        stone: {
          ink: '#0c0a09',
          dark: '#1c1917',
          medium: '#44403c',
          light: '#78716c',
          muted: '#a8a29e',
        },
        // Legacy domination colors (keeping for compatibility)
        domination: {
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fcd38c',
          300: '#fbc15f',
          400: '#fab53d',
          500: '#dc2626', // Changed to Alert Red
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#6a1a1a',
        },
        // Team colors
        team: {
          red: '#dc2626',
          blue: '#2563eb',
          green: '#22c55e',
          yellow: '#eab308',
          purple: '#a855f7',
          orange: '#f97316',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-danger': 'pulse-danger 1s ease-in-out infinite',
        'capture': 'capture 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        capture: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-danger': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-red-lg': '0 0 30px rgba(220, 38, 38, 0.5)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'tactical': '0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.1)',
        'tactical-lg': '0 2px 4px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
