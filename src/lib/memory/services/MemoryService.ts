import { MemoryStorage } from '../storage/MemoryStorage';
import { MemoryItem, MemoryScope, MemoryCategory, MemorySearchResult, MemoryStatistics } from '../types';

export class MemoryService {
  private static instance: MemoryService;
  private storage: MemoryStorage;

  private constructor() {
    this.storage = MemoryStorage.getInstance();
  }

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  public async storeMemory(
    content: string,
    scope: MemoryScope,
    category: MemoryCategory,
    metadata: Record<string, string | number | boolean | string[] | undefined> = {},
    type: 'short-term' | 'long-term' = 'long-term',
  ): Promise<MemoryItem> {
    console.log(`[MemoryService] Storing memory. Scope: ${scope}, Category: ${category}`);

    return this.storage.save({
      content,
      scope,
      category,
      metadata,
      type,
    });
  }

  public async retrieveMemory(
    query: string,
    scope?: MemoryScope,
    category?: MemoryCategory,
  ): Promise<MemorySearchResult[]> {
    console.log(`[MemoryService] Retrieving memories for query: "${query}"`);
    const results = this.storage.search(query, scope, category);

    results.forEach((res) => {
      try {
        this.storage.update(res.item.id, {
          accessCount: (res.item.accessCount || 0) + 1,
          lastAccessedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Error updating access metadata:', e);
      }
    });

    return results;
  }

  public async deleteMemory(id: string): Promise<void> {
    console.log(`[MemoryService] Deleting memory with ID: ${id}`);
    this.storage.delete(id);
  }

  public async searchMemory(
    query: string,
    scope?: MemoryScope,
    category?: MemoryCategory,
  ): Promise<MemorySearchResult[]> {
    return this.retrieveMemory(query, scope, category);
  }

  public async getRelevantContext(
    query: string,
    filters?: { scope?: MemoryScope; category?: MemoryCategory; agentId?: string; conversationId?: string },
    limit: number = 3,
  ): Promise<string> {
    console.log(`[MemoryService] Formulating relevant context block for query: "${query}"`);

    const searchResults = this.storage.search(query, filters?.scope, filters?.category);

    let filteredResults = searchResults;
    if (filters?.agentId) {
      filteredResults = filteredResults.filter(
        (res) => res.item.metadata?.agentId === filters.agentId,
      );
    }
    if (filters?.conversationId) {
      filteredResults = filteredResults.filter(
        (res) => res.item.metadata?.conversationId === filters.conversationId,
      );
    }

    const topResults = filteredResults.slice(0, limit);

    if (topResults.length === 0) {
      return '';
    }

    topResults.forEach((res) => {
      try {
        this.storage.update(res.item.id, {
          accessCount: (res.item.accessCount || 0) + 1,
          lastAccessedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    });

    const contextLines = topResults.map(
      (res, idx) => `[Memória Relacionada #${idx + 1}] (${res.item.scope}/${res.item.category}): "${res.item.content}"`,
    );

    return `\n--- INFORMAÇÕES DE MEMÓRIA RECUPERADAS ---\n${contextLines.join('\n')}\n-----------------------------------------\n`;
  }

  public async getMemoryStatistics(): Promise<MemoryStatistics> {
    return this.storage.statistics();
  }

  public async summarizeMemory(memories: MemoryItem[]): Promise<string> {
    if (memories.length === 0) return 'Sem memórias registradas.';

    const scopes = Array.from(new Set(memories.map((m) => m.scope))).join(', ');
    return `Compilado de ${memories.length} memórias nos escopos (${scopes}). Temas principais: ${memories
      .slice(0, 3)
      .map((m) => m.content.substring(0, 40) + '...')
      .join('; ')}`;
  }
}

export default MemoryService;
