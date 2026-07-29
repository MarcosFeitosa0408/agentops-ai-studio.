import React from 'react';
import { Bookmark, FileText } from 'lucide-react';
import { SourceReference } from '@/lib/rag/types';
import { Card } from '@/components/ui/Card';

export interface CitationCardProps {
  reference: SourceReference;
  className?: string;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  reference: ref,
  className = '',
}) => {
  return (
    <Card className={`border-border/60 bg-neutral-light/20 p-3.5 space-y-2.5 hover:border-primary/20 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 text-[10px] text-text-muted border-b border-border/40 pb-1.5">
        <span className="flex items-center gap-1 font-bold text-text-secondary truncate">
          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
          {ref.documentName}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {ref.pageNumber && (
            <span className="flex items-center gap-1 font-semibold">
              <Bookmark className="h-3 w-3" />
              Pág. {ref.pageNumber}
            </span>
          )}
          <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-xs font-bold font-mono">
            {(ref.score * 100).toFixed(0)}% Match
          </span>
        </div>
      </div>

      {/* Snippet */}
      <p className="text-text-secondary text-[11px] leading-relaxed break-words italic line-clamp-3">
        &quot;{ref.content}&quot;
      </p>
    </Card>
  );
};

export default CitationCard;
