'use client';

import React, { forwardRef, useId } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, error, id, disabled, checked, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={radioId}
          className={`text-text-primary inline-flex cursor-pointer items-start gap-2.5 text-sm font-medium select-none ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <div className="relative mt-0.5 flex items-center justify-center">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              disabled={disabled}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`bg-surface peer-focus-visible:ring-primary/40 flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${error ? 'border-danger' : 'border-border peer-hover:border-text-muted'} peer-checked:border-primary ${disabled ? 'bg-neutral-light border-border' : ''} ${className} `}
            >
              {checked && <span className="bg-primary h-2 w-2 rounded-full" />}
            </div>
          </div>
          {label && <span className="pt-px">{label}</span>}
        </label>
        {error && (
          <p className="text-danger ml-6.5 text-xs font-medium select-none" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Radio.displayName = 'Radio';
export default Radio;
