import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { SearchResult } from '@/lib/rag/types';
import { CitationCard } from './CitationCard';

export interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
}) => {
  if (!query.trim()) {
    return (
      <div className="border border-dashed border-border/80 rounded-2xl p-10 text-center text-text-muted select-none bg-card">
        <Search className="h-7 w-7 mx-auto mb-2.5 text-text-muted opacity-50" />
        <p className="text-sm font-semibold">Consulte a Base de Conhecimento</p>
        <p className="text-xs mt-1">Digite termos no campo de pesquisa acima para recuperar trechos relevantes.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="border border-dashed border-border/80 rounded-2xl p-10 text-center text-text-muted select-none bg-card">
        <Search className="h-7 w-7 mx-auto mb-2.5 text-text-muted opacity-50" />
        <p className="text-sm font-semibold">Nenhum trecho correspondente</p>
        <p className="text-xs mt-1">Tente usar palavras-chave diferentes ou verifique se o documento está indexado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left select-none">
      <div className="flex items-center gap-1.5 px-1">
        <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
        <h4 className="text-text-primary text-xs font-bold uppercase tracking-wider">
          Trechos Semânticos Recuperados ({results.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((res) => (
          <CitationCard key={res.chunk.id} reference={res.reference} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
