// Military/Tactical Design System

export const militaryColors = {
  // Primary colors - Military greens
  olive: {
    50: '#f5f7f4',
    100: '#e8ebe5',
    200: '#d1d9cb',
    300: '#b0bfa4',
    400: '#8da379',
    500: '#6d8659',
    600: '#556b45',
    700: '#455639',
    800: '#3a4630',
    900: '#2f3a27',
  },

  // Secondary - Tactical grays
  tactical: {
    50: '#f6f6f6',
    100: '#e7e7e7',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6d6d6d',
    600: '#5d5d5d',
    700: '#4f4f4f',
    800: '#454545',
    900: '#3d3d3d',
    950: '#262626',
  },

  // Accent - Mission critical
  amber: {
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // Status colors
  status: {
    active: '#10b981',    // Green for active missions
    pending: '#f59e0b',   // Amber for pending
    completed: '#6366f1', // Indigo for completed
    cancelled: '#ef4444', // Red for cancelled
  }
};

export const militaryFonts = {
  mono: '"Courier New", Courier, monospace',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export const militaryPatterns = {
  // Tactical grid background
  grid: `
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
  `,

  // Camouflage-inspired subtle pattern
  camo: `
    background-image:
      radial-gradient(circle at 20% 50%, rgba(109, 134, 89, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(85, 107, 69, 0.1) 0%, transparent 50%);
  `,

  // Hex pattern
  hexPattern: `
    background-image: url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(109, 134, 89, 0.05)' fill-rule='evenodd'%3E%3Cg fill='rgba(109, 134, 89, 0.05)' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  `,
};

export const militaryShadows = {
  tactical: '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
  command: '0 4px 16px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
  elevated: '0 8px 24px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.5)',
};

export const militaryEffects = {
  // Scanline effect for HUD style
  scanlines: `
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.05) 0px,
        transparent 1px,
        transparent 2px,
        rgba(0, 0, 0, 0.05) 3px
      );
      pointer-events: none;
    }
  `,

  // Corner brackets for tactical feel
  cornerBrackets: `
    position: relative;
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      border: 2px solid;
    }
    &::before {
      top: -2px;
      left: -2px;
      border-right: none;
      border-bottom: none;
    }
    &::after {
      bottom: -2px;
      right: -2px;
      border-left: none;
      border-top: none;
    }
  `,
};

// Status badge classes
export const statusClasses = {
  DRAFT: 'bg-tactical-600 text-tactical-100 border border-tactical-500',
  PUBLISHED: 'bg-amber-600 text-white border border-amber-500',
  ACTIVE: 'bg-green-600 text-white border border-green-500',
  COMPLETED: 'bg-indigo-600 text-white border border-indigo-500',
  CANCELLED: 'bg-red-600 text-white border border-red-500',
};

// Role badge classes
export const roleClasses = {
  CREATOR: 'bg-olive-700 text-olive-100 border border-olive-600',
  CO_ADMIN: 'bg-amber-700 text-amber-100 border border-amber-600',
  VIEWER: 'bg-tactical-700 text-tactical-100 border border-tactical-600',
};
