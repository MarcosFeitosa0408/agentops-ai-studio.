import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RetrievalService } from '@/lib/rag/services/RetrievalService';
import { ChunkIndexer } from '@/lib/rag/indexers/ChunkIndexer';
import { SearchResult } from '@/lib/rag/types';

describe('RAG Retrieval Service Unit Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => '',
    };

    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', mockLocalStorage);

    // Reset singletons
    // @ts-expect-error - reset private instance
    RetrievalService.instance = undefined;
    // @ts-expect-error - reset private instance
    ChunkIndexer.instance = undefined;
  });

  it('should seed database and perform keyword search', async () => {
    const indexer = ChunkIndexer.getInstance();
    const service = RetrievalService.getInstance();

    // Check indexing
    const docs = indexer.getDocuments();
    expect(docs.length).toBe(3); // Standard docs: LGPD, Contrato, Deploy

    const query = 'LGPD';
    const results = await service.retrieve(query);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThanOrEqual(0.4);
    expect(results[0].reference.documentName).toBe('politica_lgpd_agentops.pdf');
  });

  it('should filter search results by document ID', async () => {
    const indexer = ChunkIndexer.getInstance();
    const service = RetrievalService.getInstance();
    const docId = indexer.getDocuments()[0].id;

    const results = await service.retrieve('segurança', { documentId: docId });
    results.forEach((res) => {
      expect(res.chunk.documentId).toBe(docId);
    });
  });

  it('should rank results correctly in descending score order', () => {
    const service = RetrievalService.getInstance();
    const mockResults = [
      { chunk: {} as unknown as SearchResult['chunk'], score: 0.3, reference: {} as unknown as SearchResult['reference'] },
      { chunk: {} as unknown as SearchResult['chunk'], score: 0.9, reference: {} as unknown as SearchResult['reference'] },
      { chunk: {} as unknown as SearchResult['chunk'], score: 0.6, reference: {} as unknown as SearchResult['reference'] },
    ];

    const ranked = service.rank(mockResults as unknown as SearchResult[]);
    expect(ranked[0].score).toBe(0.9);
    expect(ranked[1].score).toBe(0.6);
    expect(ranked[2].score).toBe(0.3);
  });

  it('should return empty context if no matching chunks are found', async () => {
    const service = RetrievalService.getInstance();
    const context = await service.getRelevantContext('xyz_non_existent_term_999');
    expect(context).toBe('');
  });

  it('should generate formatted relevant context for matches', async () => {
    const service = RetrievalService.getInstance();
    const context = await service.getRelevantContext('compliance');
    expect(context).toContain('CONTEXTO DE DOCUMENTOS DE CONHECIMENTO RECUPERADOS');
  });
});
