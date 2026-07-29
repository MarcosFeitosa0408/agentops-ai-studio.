import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MemorySearch } from './MemorySearch';
import { MemoryFilters } from './MemoryFilters';

export interface MemoryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedScope: string;
  onScopeChange: (scope: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onCreateMemoryClick: () => void;
  onClearAllClick?: () => void;
}

export const MemoryToolbar: React.FC<MemoryToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedScope,
  onScopeChange,
  selectedCategory,
  onCategoryChange,
  onCreateMemoryClick,
  onClearAllClick,
}) => {
  return (
    <div className="bg-card border-border rounded-2xl border p-4 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left side: Search input */}
        <div className="flex-1 max-w-xl">
          <MemorySearch value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Right side: Primary action buttons */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          {onClearAllClick && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={onClearAllClick}
              className="text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/5 border-border"
            >
              Limpar Banco
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onCreateMemoryClick}
          >
            Adicionar Memória
          </Button>
        </div>
      </div>

      {/* Underline Divider */}
      <div className="border-border/40 border-t pt-1.5">
        <MemoryFilters
          selectedScope={selectedScope}
          onScopeChange={onScopeChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>
    </div>
  );
};

export default MemoryToolbar;
