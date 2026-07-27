'use client';

import React from 'react';
import { Cpu } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface WorkspaceEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const WorkspaceEmptyState: React.FC<WorkspaceEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onActionClick,
}) => {
  const actionConfig =
    actionLabel && onActionClick
      ? {
          label: actionLabel,
          onClick: onActionClick,
        }
      : undefined;

  return (
    <div className="flex h-full min-h-[300px] items-center justify-center p-6">
      <EmptyState
        title={title}
        description={description}
        icon={Cpu}
        action={actionConfig}
      />
    </div>
  );
};

export default WorkspaceEmptyState;
