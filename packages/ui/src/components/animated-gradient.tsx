import * as React from 'react';
import { cn } from '../lib/utils';

export interface AnimatedGradientProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'aurora' | 'rainbow' | 'gradient';
}

const AnimatedGradient = React.forwardRef<HTMLDivElement, AnimatedGradientProps>(
  ({ className, variant = 'gradient', ...props }, ref) => {
    const variants = {
      aurora: 'animate-aurora bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
      rainbow: 'animate-rainbow bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
      gradient: 'animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute inset-0 opacity-30 blur-3xl',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
AnimatedGradient.displayName = 'AnimatedGradient';

export { AnimatedGradient };
