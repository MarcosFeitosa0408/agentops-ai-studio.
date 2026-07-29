import React from 'react';
import { Layers, Bookmark, Hash } from 'lucide-react';
import { DocumentChunk } from '@/lib/rag/types';
import { Card } from '@/components/ui/Card';

export interface ChunkViewerProps {
  chunks: DocumentChunk[];
  documentName?: string;
  loading?: boolean;
}

export const ChunkViewer: React.FC<ChunkViewerProps> = ({
  chunks,
  documentName = 'Documento',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-neutral-light/20 h-28 border-border" />
        ))}
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <div className="border border-border/80 rounded-xl p-8 text-center text-text-muted select-none bg-card">
        <Layers className="h-7 w-7 mx-auto mb-2.5 text-text-muted opacity-60" />
        <p className="text-sm font-semibold">Nenhum pedaço (chunk) disponível</p>
        <p className="text-xs mt-1">Selecione um documento na barra lateral para detalhar os retalhos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left select-none">
      <div className="flex items-center justify-between">
        <h4 className="text-text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-indigo-500" />
          Retalhos Segmentados de &quot;{documentName}&quot;
        </h4>
        <span className="text-[11px] text-text-muted font-medium bg-neutral-light px-2 py-0.5 rounded-sm">
          {chunks.length} chunks
        </span>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {chunks.map((chunk) => (
          <Card
            key={chunk.id}
            className="border-border/60 hover:border-primary/20 transition-colors p-4 space-y-3"
          >
            {/* Header properties */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-[10px] text-text-muted border-b border-border/30 pb-2">
              <span className="font-mono bg-neutral-light px-1.5 py-0.5 rounded-xs font-bold text-text-primary">
                CHUNK_ID: {chunk.id.split('-').pop()}
              </span>

              <div className="flex items-center gap-3">
                {chunk.metadata.pageNumber && (
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3" />
                    Pág. {chunk.metadata.pageNumber}
                  </span>
                )}
                {chunk.metadata.lineNumber && (
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Linha {chunk.metadata.lineNumber}
                  </span>
                )}
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <Layers className="h-3 w-3" />
                  {chunk.metadata.wordCount} palavras
                </span>
              </div>
            </div>

            {/* Chunk text content */}
            <p className="text-text-primary text-xs leading-relaxed break-words whitespace-pre-wrap italic">
              &quot;{chunk.content}&quot;
            </p>

            {chunk.metadata.sectionTitle && (
              <p className="text-[9px] text-text-muted font-bold uppercase">
                Seção: {chunk.metadata.sectionTitle}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChunkViewer;
