import React from 'react';
import { Shield, Database, Server } from 'lucide-react';
import { IndexMetadata } from '@/lib/rag/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export interface IndexStatusProps {
  metadata: IndexMetadata | null;
  loading?: boolean;
}

export const IndexStatus: React.FC<IndexStatusProps> = ({
  metadata,
  loading = false,
}) => {
  if (loading || !metadata) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-neutral-light/20 p-5 h-24 border-border" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Documentos Indexados',
      value: metadata.totalDocuments,
      icon: Shield,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Total de Retalhos (Chunks)',
      value: metadata.totalChunks,
      icon: Database,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Mecanismo RAG Ativo',
      value: 'Local Keyword',
      icon: Server,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="p-1 border-border bg-card">
            <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
              <span className="text-text-secondary text-[11px] font-bold uppercase tracking-wider">
                {item.title}
              </span>
              <div className={`p-2 rounded-lg border ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-1.5">
              <span className="text-text-primary text-xl font-extrabold tracking-tight">
                {item.value}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IndexStatus;
