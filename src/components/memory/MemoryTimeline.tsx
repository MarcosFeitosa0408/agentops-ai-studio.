import React from 'react';
import { MemoryItem } from '@/lib/memory/types';
import { MemoryCard } from './MemoryCard';

export interface MemoryTimelineProps {
  memories: MemoryItem[];
  onDelete?: (id: string) => void;
  onSelect?: (memory: MemoryItem) => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  memories,
  onDelete,
  onSelect,
}) => {
  const groupMemoriesByDate = () => {
    const groups: { [key: string]: MemoryItem[] } = {};
    memories.forEach((mem) => {
      try {
        const dateStr = new Date(mem.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(mem);
      } catch {
        const fallback = 'Fatos Gerais';
        if (!groups[fallback]) groups[fallback] = [];
        groups[fallback].push(mem);
      }
    });
    return groups;
  };

  const grouped = groupMemoriesByDate();

  return (
    <div className="space-y-8 relative pl-4 md:pl-6 border-l border-border/80 ml-2 md:ml-4 py-2 select-none">
      {Object.entries(grouped).map(([dateGroup, items]) => (
        <div key={dateGroup} className="relative space-y-4">
          {/* Timeline Dot & Date Label */}
          <div className="absolute -left-[25px] md:-left-[33px] top-1 flex items-center justify-center">
            <div className="bg-primary border-background h-4.5 w-4.5 rounded-full border-4 shadow-sm" />
          </div>

          <h4 className="text-text-primary text-xs font-bold tracking-wider uppercase bg-surface/80 border border-border/50 px-2.5 py-1 rounded-md inline-block shadow-2xs backdrop-blur-xs">
            {dateGroup}
          </h4>

          {/* Grid of memory cards under this group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                {/* Visual Connector Line to the Card */}
                <div className="absolute top-1/2 -left-4 md:-left-6 w-4 md:w-6 border-t border-dashed border-border/80 group-hover:border-primary/40 transition-colors" />
                <MemoryCard memory={item} onDelete={onDelete} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryTimeline;
