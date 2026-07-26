'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    // Size styles
    const sizeStyles = {
      xs: 'px-2 py-1 text-xs gap-1',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    // Variant styles
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
      secondary:
        'bg-neutral-light text-text-primary hover:bg-border border border-border dark:bg-neutral-light dark:hover:bg-border/80',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-neutral-light',
      ghost: 'bg-transparent text-text-primary hover:bg-neutral-light',
      link: 'bg-transparent text-primary p-0 rounded-none hover:underline shadow-none active:scale-100',
      success: 'bg-success text-success-foreground hover:bg-success-hover shadow-sm',
      warning: 'bg-warning text-warning-foreground hover:bg-warning-hover shadow-sm',
      danger: 'bg-danger text-danger-foreground hover:bg-danger-hover shadow-sm',
    };

    const isBtnDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isBtnDisabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
