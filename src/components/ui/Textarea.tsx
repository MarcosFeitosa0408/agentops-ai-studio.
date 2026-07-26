'use client';

import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, helperText, error, disabled, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-text-primary text-sm font-medium select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            `${error ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined
          }
          className={`bg-surface text-text-primary placeholder:text-text-muted w-full resize-y rounded-lg border p-3 text-sm transition-all duration-200 outline-none ${disabled ? 'bg-neutral-light cursor-not-allowed opacity-50' : 'hover:border-text-muted focus:border-primary focus:ring-primary/20 focus:ring-2'} ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'} ${className} `}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
export default Textarea;
