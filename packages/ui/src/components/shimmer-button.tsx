import * as React from 'react';
import { cn } from '../lib/utils';

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      className,
      children,
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md bg-primary px-6 font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/50',
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div
          className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            backgroundSize: `${shimmerSize} 100%`,
            animation: `shimmer ${shimmerDuration} infinite`,
          }}
        />
      </button>
    );
  }
);
ShimmerButton.displayName = 'ShimmerButton';

export { ShimmerButton };
