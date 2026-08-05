import { MemoryService } from '../lib/memory/services/MemoryService';
import { MemoryScope, MemoryCategory, MemoryItem } from '../lib/memory/types';

export class WorkerMemory {
  private memoryService: MemoryService;
  private workerId: string;

  constructor(workerId: string) {
    this.memoryService = MemoryService.getInstance();
    this.workerId = workerId;
  }

  /**
   * Stores a memory associated with this worker
   */
  public async store(
    content: string,
    category: MemoryCategory = 'semantic_fact',
    scope: MemoryScope = 'agent',
    metadata: Record<string, string | number | boolean | string[] | undefined> = {},
    type: 'short-term' | 'long-term' = 'long-term',
  ): Promise<MemoryItem> {
    return this.memoryService.storeMemory(
      content,
      scope,
      category,
      {
        ...metadata,
        agentId: this.workerId,
        source: 'WorkerMemory',
      },
      type,
    );
  }

  /**
   * Retrieves relevant context block for a query
   */
  public async getRelevantContext(query: string, limit: number = 3): Promise<string> {
    return this.memoryService.getRelevantContext(
      query,
      {
        agentId: this.workerId,
        scope: 'agent',
      },
      limit,
    );
  }

  /**
   * Searches memories related to this worker
   */
  public async search(query: string, category?: MemoryCategory) {
    const results = await this.memoryService.searchMemory(query, 'agent', category);
    return results.filter((res) => res.item.metadata?.agentId === this.workerId);
  }
}
