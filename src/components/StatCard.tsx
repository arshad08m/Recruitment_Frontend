import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'destructive' | 'warning';
  className?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon: Icon, variant = 'default', className }, ref) => {
    const variantStyles = {
      default: 'border-border',
      primary: 'border-l-4 border-l-primary',
      success: 'border-l-4 border-l-success',
      destructive: 'border-l-4 border-l-destructive',
      warning: 'border-l-4 border-l-warning',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card rounded-xl p-5 shadow-card hover:shadow-elevated transition-all duration-300',
          variantStyles[variant],
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          {Icon && (
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              variant === 'primary' && 'bg-primary/10 text-primary',
              variant === 'success' && 'bg-success/10 text-success',
              variant === 'destructive' && 'bg-destructive/10 text-destructive',
              variant === 'warning' && 'bg-warning/10 text-warning',
              variant === 'default' && 'bg-muted text-muted-foreground',
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
