'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onRemove?: () => void;
  avatarSrc?: string;
  avatarAlt?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  className = '',
  variant = 'secondary',
  onRemove,
  avatarSrc,
  avatarAlt = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 border';

  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    secondary:
      'bg-neutral-light text-text-secondary border-border hover:bg-border dark:bg-neutral-light/50',
    success: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {avatarSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="-ml-1 h-4 w-4 shrink-0 rounded-full object-cover"
        />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-foreground/10 -mr-1 rounded-full p-0.5 transition-colors focus:outline-none"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default Chip;
