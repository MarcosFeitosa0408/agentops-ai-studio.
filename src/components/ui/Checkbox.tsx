'use client';

import React, { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className = '', label, error, indeterminate = false, id, disabled, checked, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={`text-text-primary inline-flex cursor-pointer items-start gap-2.5 text-sm font-medium select-none ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <div className="relative mt-0.5 flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`bg-surface peer-focus-visible:ring-primary/40 flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${error ? 'border-danger' : 'border-border peer-hover:border-text-muted'} peer-checked:bg-primary peer-checked:border-primary ${indeterminate ? 'bg-primary border-primary' : ''} ${disabled ? 'bg-neutral-light border-border' : ''} ${className} `}
            >
              {indeterminate ? (
                <Minus className="h-3 w-3 stroke-[3px] text-white" />
              ) : checked ? (
                <Check className="h-3 w-3 stroke-[3px] text-white" />
              ) : null}
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

Checkbox.displayName = 'Checkbox';
export default Checkbox;
