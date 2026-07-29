import { MemoryItem, MemoryScope, MemoryCategory, MemoryStatistics, MemorySearchResult } from '../types';

const STORAGE_KEY = 'agentops_memory_store';

const INITIAL_MOCK_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    content: 'O usuário prefere explicações detalhadas de engenharia de sistemas (modelo preferido: Claude 3.5 Sonnet).',
    scope: 'user',
    category: 'core_preference',
    metadata: { userId: 'user-default', tags: ['preferência', 'modelo'] },
    createdAt: '2025-02-28T10:00:00.000Z',
    updatedAt: '2025-02-28T10:00:00.000Z',
    accessCount: 15,
    lastAccessedAt: '2025-02-28T14:00:00.000Z',
    type: 'long-term',
  },
  {
    id: 'mem-2',
    content: 'Objetivo do projeto: Desenvolver um agente de geração de relatórios de vendas automatizado.',
    scope: 'project',
    category: 'semantic_fact',
    metadata: { projectId: 'proj-default', tags: ['projeto', 'relatórios'] },
    createdAt: '2025-02-27T09:15:00.000Z',
    updatedAt: '2025-02-27T09:15:00.000Z',
    accessCount: 8,
    lastAccessedAt: '2025-02-28T13:45:00.000Z',
    type: 'long-term',
  },
  {
    id: 'mem-3',
    content: 'Última instrução do usuário: "Gere apenas código SQL limpo, seguro e otimizado para PostgreSQL."',
    scope: 'conversation',
    category: 'context_history',
    metadata: { conversationId: 'conv-sql-101', agentId: 'agent-2', tags: ['sql', 'postgre'] },
    createdAt: '2025-02-28T14:28:00.000Z',
    updatedAt: '2025-02-28T14:28:00.000Z',
    accessCount: 2,
    lastAccessedAt: '2025-02-28T14:30:00.000Z',
    type: 'short-term',
  },
  {
    id: 'mem-4',
    content: 'Configuração do Agente 1: Habilitar análise exploratória profunda de dados com bibliotecas estatísticas.',
    scope: 'agent',
    category: 'core_preference',
    metadata: { agentId: 'agent-1', tags: ['config', 'dados'] },
    createdAt: '2025-02-25T11:00:00.000Z',
    updatedAt: '2025-02-25T11:00:00.000Z',
    accessCount: 23,
    lastAccessedAt: '2025-02-28T12:10:00.000Z',
    type: 'long-term',
  },
  {
    id: 'mem-5',
    content: 'O sistema deve aplicar criptografia AES-256 para dados sensíveis em repouso.',
    scope: 'global',
    category: 'semantic_fact',
    metadata: { tags: ['segurança', 'compliance'] },
    createdAt: '2025-02-24T08:00:00.000Z',
    updatedAt: '2025-02-24T08:00:00.000Z',
    accessCount: 42,
    lastAccessedAt: '2025-02-28T14:15:00.000Z',
    type: 'long-term',
  }
];

export class MemoryStorage {
  private static instance: MemoryStorage;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private ensureInitialized(): void {
    if (!this.isBrowser()) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MEMORIES));
      }
    } catch (e) {
      console.error('Failed to initialize local memory storage:', e);
    }
  }

  private getItems(): MemoryItem[] {
    if (!this.isBrowser()) {
      return INITIAL_MOCK_MEMORIES;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_MOCK_MEMORIES;
    } catch (e) {
      console.error('Error reading memory from localStorage:', e);
      return INITIAL_MOCK_MEMORIES;
    }
  }

  private saveItems(items: MemoryItem[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving memory to localStorage:', e);
    }
  }

  public save(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): MemoryItem {
    const items = this.getItems();
    const timestamp = new Date().toISOString();
    const newItem: MemoryItem = {
      ...item,
      id: `mem-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      accessCount: 0,
    };
    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  }

  public update(id: string, updates: Partial<MemoryItem>): MemoryItem {
    const items = this.getItems();
    let updatedItem: MemoryItem | null = null;

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) {
      throw new Error(`Memory with ID '${id}' not found.`);
    }

    this.saveItems(updatedItems);
    return updatedItem;
  }

  public delete(id: string): void {
    const items = this.getItems();
    const filtered = items.filter((item) => item.id !== id);
    this.saveItems(filtered);
  }

  public search(query: string, scope?: MemoryScope, category?: MemoryCategory): MemorySearchResult[] {
    const items = this.getItems();
    const normalizedQuery = query.toLowerCase().trim();

    return items
      .filter((item) => {
        if (scope && item.scope !== scope) return false;
        if (category && item.category !== category) return false;
        if (!normalizedQuery) return true;

        const contentMatches = item.content.toLowerCase().includes(normalizedQuery);
        const tagMatches = item.metadata.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedQuery),
        );
        return contentMatches || tagMatches;
      })
      .map((item) => {
        let score = 0.5;
        if (normalizedQuery) {
          if (item.content.toLowerCase() === normalizedQuery) {
            score = 1.0;
          } else if (item.content.toLowerCase().startsWith(normalizedQuery)) {
            score = 0.9;
          } else if (item.content.toLowerCase().includes(normalizedQuery)) {
            score = 0.75;
          } else if (
            item.metadata.tags?.some((t) => t.toLowerCase() === normalizedQuery)
          ) {
            score = 0.8;
          }
        }
        return { item, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  public clear(): void {
    this.saveItems([]);
  }

  public list(): MemoryItem[] {
    return this.getItems();
  }

  public statistics(): MemoryStatistics {
    const items = this.getItems();
    const byScope: Record<MemoryScope, number> = {
      conversation: 0,
      agent: 0,
      project: 0,
      user: 0,
      global: 0,
    };
    const byCategory: Record<MemoryCategory, number> = {
      core_preference: 0,
      user_info: 0,
      context_history: 0,
      semantic_fact: 0,
      other: 0,
    };

    let totalAccesses = 0;
    let shortTermCount = 0;
    let longTermCount = 0;

    items.forEach((item) => {
      byScope[item.scope] = (byScope[item.scope] || 0) + 1;
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      totalAccesses += item.accessCount || 0;
      if (item.type === 'short-term') {
        shortTermCount++;
      } else {
        longTermCount++;
      }
    });

    return {
      totalCount: items.length,
      shortTermCount,
      longTermCount,
      byScope,
      byCategory,
      totalAccesses,
    };
  }
}

export default MemoryStorage;
