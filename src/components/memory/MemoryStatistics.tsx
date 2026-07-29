import React from 'react';
import { Database, Zap, Clock, TrendingUp } from 'lucide-react';
import { MemoryStatistics as IStats } from '@/lib/memory/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export interface MemoryStatisticsProps {
  stats: IStats | null;
  loading?: boolean;
}

export const MemoryStatistics: React.FC<MemoryStatisticsProps> = ({
  stats,
  loading = false,
}) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-neutral-light/20 p-5 h-28 border-border" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Memórias',
      value: stats.totalCount,
      description: 'Registros armazenados',
      icon: Database,
      colorClass: 'bg-primary/15 text-primary border-primary/20',
    },
    {
      title: 'Longo Prazo',
      value: stats.longTermCount,
      description: 'Fatos e preferências persistidas',
      icon: Zap,
      colorClass: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/20',
    },
    {
      title: 'Curto Prazo',
      value: stats.shortTermCount,
      description: 'Armazenamento conversacional',
      icon: Clock,
      colorClass: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
    },
    {
      title: 'Total de Acessos',
      value: stats.totalAccesses,
      description: 'Leituras do AI Gateway',
      icon: TrendingUp,
      colorClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="p-1.5 border-border bg-card">
            <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-text-secondary text-[11px] font-bold tracking-wider uppercase">
                  {card.title}
                </CardTitle>
                <p className="text-text-muted text-[10px] leading-none">
                  {card.description}
                </p>
              </div>
              <div className={`p-2 rounded-lg border ${card.colorClass}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <span className="text-text-primary text-2xl font-extrabold tracking-tight">
                {card.value}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MemoryStatistics;
