'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
}) => {
  return (
    <div className="border-border bg-surface/50 mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center select-none">
      {Icon && (
        <div className="bg-neutral-light text-text-secondary mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-text-primary mb-2 text-lg leading-none font-semibold">{title}</h3>
      <p className="text-text-muted mb-6 text-sm leading-relaxed">{description}</p>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
