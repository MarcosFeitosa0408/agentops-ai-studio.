import React from 'react';
import { Trash2, Calendar, Eye, Database } from 'lucide-react';
import { MemoryItem } from '@/lib/memory/types';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { MemoryBadge } from './MemoryBadge';

export interface MemoryCardProps {
  memory: MemoryItem;
  onDelete?: (id: string) => void;
  onSelect?: (memory: MemoryItem) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onDelete,
  onSelect,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="hover:border-primary/25 border-border transition-all duration-200">
      <div className="p-4 sm:p-5 flex flex-col gap-3.5 h-full justify-between">
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <MemoryBadge scope={memory.scope} />
            <MemoryBadge category={memory.category} />
            <MemoryBadge type={memory.type} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onSelect && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onSelect(memory)}
                aria-label="Visualizar Detalhes"
              >
                <Eye className="h-4 w-4 text-text-secondary" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onDelete(memory.id)}
                aria-label="Excluir Memória"
                className="hover:text-danger text-text-muted hover:bg-danger/10"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1">
          <p className="text-text-primary text-sm font-medium leading-relaxed break-words whitespace-pre-line">
            {memory.content}
          </p>
        </div>

        {/* Footer info: access statistics and dates */}
        <div className="border-border/40 border-t pt-3 mt-1 flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Criado em {formatDate(memory.createdAt)}
          </span>

          <span className="flex items-center gap-1 font-medium bg-neutral-light/50 px-1.5 py-0.5 rounded-sm">
            <Database className="h-3.5 w-3.5 text-primary shrink-0" />
            Acessos: {memory.accessCount || 0}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MemoryCard;
