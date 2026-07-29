import { useState, useEffect, useCallback } from 'react';
import { MemoryService } from '../services/MemoryService';
import { MemoryItem, MemoryStatistics, MemoryScope, MemoryCategory } from '../types';

export function useMemoryStore() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [stats, setStats] = useState<MemoryStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const service = MemoryService.getInstance();
      const items = await service.searchMemory('');
      const statistics = await service.getMemoryStatistics();

      setTimeout(() => {
        setMemories(items.map((r) => r.item));
        setStats(statistics);
        setLoading(false);
      }, 0);
    } catch (err) {
      console.error('Failed to load memory store:', err);
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const addMemory = async (
    content: string,
    scope: MemoryScope,
    category: MemoryCategory,
    metadata?: Record<string, string | number | boolean | string[] | undefined>,
  ) => {
    const service = MemoryService.getInstance();
    await service.storeMemory(content, scope, category, metadata || {});
    await refresh();
  };

  const removeMemory = async (id: string) => {
    const service = MemoryService.getInstance();
    await service.deleteMemory(id);
    await refresh();
  };

  return {
    memories,
    stats,
    loading,
    refresh,
    addMemory,
    removeMemory,
  };
}
