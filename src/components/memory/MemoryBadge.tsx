import React from 'react';
import { MemoryScope, MemoryCategory } from '@/lib/memory/types';
import { formatScopeLabel, formatCategoryLabel, getScopeColor } from '@/lib/memory/utils';

export interface MemoryBadgeProps {
  scope?: MemoryScope;
  category?: MemoryCategory;
  type?: 'short-term' | 'long-term';
  className?: string;
}

export const MemoryBadge: React.FC<MemoryBadgeProps> = ({
  scope,
  category,
  type,
  className = '',
}) => {
  if (scope) {
    const colorClass = getScopeColor(scope);
    return (
      <span
        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colorClass} ${className}`}
      >
        {formatScopeLabel(scope)}
      </span>
    );
  }

  if (category) {
    return (
      <span
        className={`bg-secondary/10 text-text-secondary border-border/40 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider dark:bg-secondary/20 ${className}`}
      >
        {formatCategoryLabel(category)}
      </span>
    );
  }

  if (type) {
    const isShort = type === 'short-term';
    const colorClass = isShort
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';

    return (
      <span
        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colorClass} ${className}`}
      >
        {isShort ? 'Curto Prazo' : 'Longo Prazo'}
      </span>
    );
  }

  return null;
};

export default MemoryBadge;
