'use client';

import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'type' | 'rightElement'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const eyeButton = (
      <button
        type="button"
        disabled={disabled}
        onClick={toggleVisibility}
        className="text-text-muted hover:text-text-primary cursor-pointer focus:outline-none disabled:opacity-50"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    );

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        rightElement={eyeButton}
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
