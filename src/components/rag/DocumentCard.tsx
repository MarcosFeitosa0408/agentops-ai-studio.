import React from 'react';
import { FileText, Trash2, Layers, HardDrive } from 'lucide-react';
import { Document } from '@/lib/rag/types';
import { formatBytes, getDocumentTypeColor } from '@/lib/rag/utils';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';

export interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  onSelect?: (document: Document) => void;
  isSelected?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  const typeColor = getDocumentTypeColor(doc.type);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card
      className={`border-border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-primary/40 bg-primary/5 border-primary/40'
          : 'hover:border-primary/20 hover:bg-neutral-light/10'
      }`}
      onClick={() => onSelect?.(doc)}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Document type Icon */}
        <div className={`p-2.5 rounded-xl border shrink-0 ${typeColor}`}>
          <FileText className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-text-primary text-sm font-bold truncate tracking-tight">
              {doc.name}
            </h4>
            <span
              className={`text-[9px] uppercase tracking-wider font-bold border px-1 rounded-sm ${typeColor}`}
            >
              {doc.type}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5 shrink-0" />
              {formatBytes(doc.size)}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
              {doc.chunksCount} retalhos (chunks)
            </span>
          </div>

          <p className="text-[10px] text-text-muted">
            Indexado em {formatDate(doc.createdAt)}
          </p>
        </div>

        {/* Delete action */}
        {onDelete && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Avoid choosing the card
              onDelete(doc.id);
            }}
            aria-label="Excluir Documento"
            className="hover:text-danger hover:bg-danger/10 text-text-muted shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        )}
      </div>
    </Card>
  );
};

export default DocumentCard;
