'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  'aria-label': string; // Enforce accessibility label
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'outline',
      size = 'md',
      isLoading = false,
      disabled = false,
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const sizeStyles = {
      xs: 'p-1 text-xs h-7 w-7',
      sm: 'p-1.5 text-sm h-8 w-8',
      md: 'p-2 text-sm h-10 w-10',
      lg: 'p-2.5 text-base h-12 w-12',
    };

    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
      secondary: 'bg-neutral-light text-text-primary hover:bg-border border border-border',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-neutral-light',
      ghost: 'bg-transparent text-text-primary hover:bg-neutral-light',
      success: 'bg-success text-success-foreground hover:bg-success-hover shadow-sm',
      warning: 'bg-warning text-warning-foreground hover:bg-warning-hover shadow-sm',
      danger: 'bg-danger text-danger-foreground hover:bg-danger-hover shadow-sm',
    };

    const isBtnDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={isBtnDisabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
export default IconButton;
