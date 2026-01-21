'use client';

import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-labs-steel text-alert-yellow active:bg-labs-terminal'
          : 'bg-field-gray text-combat-yellow active:bg-field-border'
      } ${className}`}
      aria-label={theme === 'dark' ? 'Activer le mode jour' : 'Activer le mode nuit'}
    >
      {theme === 'dark' ? (
        <Sun size={20} weight="fill" />
      ) : (
        <Moon size={20} weight="fill" />
      )}
    </button>
  );
}
