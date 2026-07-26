import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  pill = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-semibold tracking-wide transition-colors duration-200';

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  const variantStyles = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-neutral-light text-text-secondary border border-border dark:bg-neutral-light/50',
    outline: 'bg-transparent border border-border text-text-secondary',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
  };

  const radiusStyle = pill ? 'rounded-full' : 'rounded-md';

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${radiusStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
