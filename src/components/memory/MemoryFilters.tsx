import React from 'react';
import { Filter } from 'lucide-react';
import { MemoryScope, MemoryCategory } from '@/lib/memory/types';
import { formatScopeLabel, formatCategoryLabel } from '@/lib/memory/utils';
import { Select } from '@/components/ui/Select';

export interface MemoryFiltersProps {
  selectedScope: string;
  onScopeChange: (scope: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const MemoryFilters: React.FC<MemoryFiltersProps> = ({
  selectedScope,
  onScopeChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const scopes: MemoryScope[] = ['conversation', 'agent', 'project', 'user', 'global'];
  const categories: MemoryCategory[] = [
    'core_preference',
    'user_info',
    'context_history',
    'semantic_fact',
    'other',
  ];

  const scopeOptions = [
    { value: 'all', label: 'Todos os Escopos' },
    ...scopes.map((s) => ({ value: s, label: formatScopeLabel(s) })),
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    ...categories.map((c) => ({ value: c, label: formatCategoryLabel(c) })),
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold shrink-0">
        <Filter className="h-4 w-4 text-primary" />
        Filtros:
      </div>

      <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
        <Select
          value={selectedScope}
          onChange={(e) => onScopeChange(e.target.value)}
          className="h-10 text-xs min-w-[150px] w-full"
        >
          {scopeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 text-xs min-w-[160px] w-full"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default MemoryFilters;
