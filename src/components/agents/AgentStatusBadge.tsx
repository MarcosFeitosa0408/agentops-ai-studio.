'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface AgentStatusBadgeProps {
  status: 'active' | 'inactive';
  className?: string;
}

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ status, className = '' }) => {
  if (status === 'active') {
    return (
      <Badge variant="success" size="md" className={className}>
        Ativo
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" size="md" className={className}>
      Inativo
    </Badge>
  );
};

export default AgentStatusBadge;
