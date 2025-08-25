import React from 'react';
import { Funnel } from 'lucide-react';

interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ className = '', size = 'md', variant = 'ghost', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'bg-primary/10 hover:bg-primary/20',
      outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    };

    return (
      <button
        ref={ref}
        className={`${sizeClasses[size]} ${variantClasses[variant]} transition-colors rounded-sm cursor-pointer flex items-center justify-center ${className}`}
        aria-label="Filter"
        {...props}
      >
        {children || <Funnel className={`${iconSizes[size]} text-primary`} />}
      </button>
    );
  }
);

FilterButton.displayName = 'FilterButton';

export default FilterButton;
