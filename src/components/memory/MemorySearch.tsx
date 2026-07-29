import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';

export interface MemorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MemorySearch: React.FC<MemorySearchProps> = ({
  value,
  onChange,
  placeholder = 'Buscar em memórias por palavra-chave...',
}) => {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
        <Search className="h-4.5 w-4.5" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 w-full"
      />
      {value && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
          <IconButton
            variant="ghost"
            size="xs"
            onClick={() => onChange('')}
            aria-label="Limpar busca"
          >
            <X className="h-3.5 w-3.5 text-text-muted hover:text-text-primary" />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default MemorySearch;
