export type MemoryScope = 'conversation' | 'agent' | 'project' | 'user' | 'global';

export type MemoryCategory = 'core_preference' | 'user_info' | 'context_history' | 'semantic_fact' | 'other';

export interface MemoryMetadata {
  agentId?: string;
  conversationId?: string;
  projectId?: string;
  userId?: string;
  tags?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface MemoryItem {
  id: string;
  content: string;
  scope: MemoryScope;
  category: MemoryCategory;
  metadata: MemoryMetadata;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  type: 'short-term' | 'long-term';
}

export interface MemorySearchResult {
  item: MemoryItem;
  score: number;
}

export interface MemoryStatistics {
  totalCount: number;
  shortTermCount: number;
  longTermCount: number;
  byScope: Record<MemoryScope, number>;
  byCategory: Record<MemoryCategory, number>;
  totalAccesses: number;
}

export interface MemoryStore {
  memories: MemoryItem[];
}
