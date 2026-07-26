'use client';

import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className = '', label, helperText, error, disabled, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-text-primary text-sm font-medium select-none">
            {label}
          </label>
        )}
        <div className="relative flex w-full items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              `${error ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined
            }
            className={`bg-surface text-text-primary placeholder:text-text-muted w-full cursor-pointer appearance-none rounded-lg border py-2 pr-10 pl-3 text-sm transition-all duration-200 outline-none ${disabled ? 'bg-neutral-light cursor-not-allowed opacity-50' : 'hover:border-text-muted focus:border-primary focus:ring-primary/20 focus:ring-2'} ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'} ${className} `}
            {...props}
          >
            {children}
          </select>
          <div className="text-text-muted pointer-events-none absolute right-3 flex shrink-0 items-center">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p id={errorId} className="text-danger text-xs font-medium select-none" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-text-muted text-xs select-none">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
