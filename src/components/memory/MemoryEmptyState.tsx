import React from 'react';
import { Database, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface MemoryEmptyStateProps {
  onClearFilters?: () => void;
  onCreateMemory?: () => void;
  isSearchActive?: boolean;
}

export const MemoryEmptyState: React.FC<MemoryEmptyStateProps> = ({
  onClearFilters,
  onCreateMemory,
  isSearchActive = false,
}) => {
  return (
    <div className="border-border bg-card rounded-2xl border border-dashed p-10 md:p-14 text-center select-none">
      <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
        <Database className="h-6 w-6" />
      </div>

      <h3 className="text-text-primary text-base font-bold tracking-tight">
        {isSearchActive ? 'Nenhuma memória encontrada' : 'Nenhuma memória registrada'}
      </h3>
      <p className="text-text-secondary mx-auto mt-1.5 max-w-sm text-xs leading-normal">
        {isSearchActive
          ? 'Não encontramos nenhum registro correspondente aos filtros de busca selecionados.'
          : 'Crie a sua primeira memória cognitiva local ou interaja com o Playground para salvar automaticamente.'}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {isSearchActive && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpar Filtros
          </Button>
        )}
        {onCreateMemory && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onCreateMemory}
          >
            Adicionar Memória
          </Button>
        )}
      </div>
    </div>
  );
};

export default MemoryEmptyState;
