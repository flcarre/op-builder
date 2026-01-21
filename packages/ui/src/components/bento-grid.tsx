import * as React from 'react';
import { cn } from '../lib/utils';

const BentoGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
BentoGrid.displayName = 'BentoGrid';

const BentoGridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
    header?: React.ReactNode;
    icon?: React.ReactNode;
  }
>(({ className, title, description, header, icon, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg',
      className
    )}
    {...props}
  >
    {header && <div className="mb-4">{header}</div>}
    <div className="flex items-start gap-4">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="flex-1">
        {title && (
          <h3 className="mb-2 font-semibold leading-none tracking-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  </div>
));
BentoGridItem.displayName = 'BentoGridItem';

export { BentoGrid, BentoGridItem };
