'use client';

import React, { forwardRef, useId } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, error, id, disabled, checked, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={switchId}
          className={`text-text-primary inline-flex cursor-pointer items-center gap-3 text-sm font-medium select-none ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <div className="relative inline-flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={switchId}
              disabled={disabled}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`bg-border peer-focus-visible:ring-primary/40 peer-checked:bg-primary relative h-5 w-9 rounded-full transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${disabled ? 'bg-neutral-light border-border border' : ''} ${className} `}
            >
              <div
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'} ${disabled ? 'bg-text-muted/40' : ''} `}
              />
            </div>
          </div>
          {label && <span>{label}</span>}
        </label>
        {error && (
          <p className="text-danger text-xs font-medium select-none" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Switch.displayName = 'Switch';
export default Switch;
