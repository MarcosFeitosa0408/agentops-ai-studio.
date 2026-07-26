'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="border-danger/20 bg-danger/5 mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border p-8 text-center select-none">
      <div className="bg-danger/10 text-danger mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-text-primary mb-2 text-lg leading-none font-semibold">{title}</h3>
      <p className="text-text-secondary mb-6 text-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Retry Action
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
