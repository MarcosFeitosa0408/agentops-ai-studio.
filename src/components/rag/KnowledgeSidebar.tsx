import React from 'react';
import { BookOpen, FolderOpen } from 'lucide-react';
import { Document } from '@/lib/rag/types';
import { DocumentCard } from './DocumentCard';

export interface KnowledgeSidebarProps {
  documents: Document[];
  selectedDocumentId: string;
  onDocumentSelect: (doc: Document) => void;
  onDocumentDelete?: (id: string) => void;
  loading?: boolean;
}

export const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = ({
  documents,
  selectedDocumentId,
  onDocumentSelect,
  onDocumentDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-neutral-light/20 h-16 rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left select-none">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="h-4.5 w-4.5 text-primary" />
          Documentos Indexados ({documents.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onSelect={onDocumentSelect}
            onDelete={onDocumentDelete}
            isSelected={doc.id === selectedDocumentId}
          />
        ))}

        {documents.length === 0 && (
          <div className="border border-dashed border-border/80 rounded-xl p-6 text-center text-text-muted">
            <FolderOpen className="h-7 w-7 mx-auto mb-2 text-text-muted opacity-50" />
            <p className="text-xs font-semibold">Nenhum documento</p>
            <p className="text-[10px] mt-0.5">Adicione arquivos na barra de uploads ao lado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeSidebar;
