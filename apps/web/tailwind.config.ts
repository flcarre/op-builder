import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#e6fffa',
          100: '#b3f5e8',
          200: '#80ebd6',
          300: '#4de1c4',
          400: '#1ad7b2',
          500: '#00c9a0',
          600: '#00a080',
          700: '#007660',
          800: '#004d40',
          900: '#002320',
        },
        neon: {
          blue: '#00f0ff',
          green: '#00ff88',
          purple: '#b388ff',
          pink: '#ff00ff',
          orange: '#ff6b35',
        },
        slate: {
          850: '#1a202e',
          900: '#0f1419',
          950: '#0a0d11',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 201, 160, 0.3)',
        'glow-md': '0 0 20px rgba(0, 201, 160, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 201, 160, 0.5)',
        'neon': '0 0 5px theme(colors.cyber.500), 0 0 20px theme(colors.cyber.500)',
        'neon-strong': '0 0 10px theme(colors.cyber.400), 0 0 40px theme(colors.cyber.500), 0 0 80px theme(colors.cyber.600)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': {
            boxShadow: '0 0 10px rgba(0, 201, 160, 0.3), 0 0 20px rgba(0, 201, 160, 0.2)',
          },
          'to': {
            boxShadow: '0 0 20px rgba(0, 201, 160, 0.6), 0 0 30px rgba(0, 201, 160, 0.3)',
          },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 201, 160, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 201, 160, 0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
