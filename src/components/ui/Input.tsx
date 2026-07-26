'use client';

import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className = '', label, helperText, error, leftElement, rightElement, disabled, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-text-primary text-sm font-medium select-none">
            {label}
          </label>
        )}
        <div className="relative flex w-full items-center">
          {leftElement && (
            <div className="text-text-muted pointer-events-none absolute left-3 flex shrink-0 items-center">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              `${error ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined
            }
            className={`bg-surface text-text-primary placeholder:text-text-muted w-full rounded-lg border py-2 text-sm transition-all duration-200 outline-none ${leftElement ? 'pl-10' : 'pl-3'} ${rightElement ? 'pr-10' : 'pr-3'} ${disabled ? 'bg-neutral-light cursor-not-allowed opacity-50' : 'hover:border-text-muted focus:border-primary focus:ring-primary/20 focus:ring-2'} ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'} ${className} `}
            {...props}
          />
          {rightElement && (
            <div className="text-text-muted absolute right-3 flex shrink-0 items-center">
              {rightElement}
            </div>
          )}
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

Input.displayName = 'Input';
export default Input;
