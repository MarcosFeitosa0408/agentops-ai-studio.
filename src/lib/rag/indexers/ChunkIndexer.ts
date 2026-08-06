import { Document, DocumentChunk, IndexMetadata } from '../types';
import { DocumentParser } from '../parsers/DocumentParser';
import { OrganizationManager } from '@/organizations/OrganizationManager';

const DOCS_KEY = 'agentops_rag_documents';
const CHUNKS_KEY = 'agentops_rag_chunks';

export class ChunkIndexer {
  private static instance: ChunkIndexer;
  private inMemoryDocs: Document[] = [];
  private inMemoryChunks: DocumentChunk[] = [];

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): ChunkIndexer {
    if (!ChunkIndexer.instance) {
      ChunkIndexer.instance = new ChunkIndexer();
    }
    return ChunkIndexer.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private ensureInitialized(): void {
    if (!this.isBrowser()) {
      // Seed in-memory for non-browser tests
      try {
        const doc1 = DocumentParser.parse('politica_lgpd_agentops.pdf', 'PDF', 12400);
        const doc2 = DocumentParser.parse('contrato_prestacao_servicos.docx', 'DOCX', 32500);
        const doc3 = DocumentParser.parse('deploy_guidelines.md', 'Markdown', 8900);

        this.inMemoryDocs = [doc1.document, doc2.document, doc3.document];
        this.inMemoryChunks = [...doc1.chunks, ...doc2.chunks, ...doc3.chunks];
      } catch {
        // ignore
      }
      return;
    }
    try {
      if (!localStorage.getItem(DOCS_KEY) || !localStorage.getItem(CHUNKS_KEY)) {
        const doc1 = DocumentParser.parse('politica_lgpd_agentops.pdf', 'PDF', 12400);
        const doc2 = DocumentParser.parse('contrato_prestacao_servicos.docx', 'DOCX', 32500);
        const doc3 = DocumentParser.parse('deploy_guidelines.md', 'Markdown', 8900);

        const initialDocs = [doc1.document, doc2.document, doc3.document];
        const initialChunks = [...doc1.chunks, ...doc2.chunks, ...doc3.chunks];

        localStorage.setItem(DOCS_KEY, JSON.stringify(initialDocs));
        localStorage.setItem(CHUNKS_KEY, JSON.stringify(initialChunks));
      }
    } catch (e) {
      console.error('Failed to seed RAG indices:', e);
    }
  }

  private getDocumentsRaw(): Document[] {
    if (!this.isBrowser()) return this.inMemoryDocs;
    try {
      const data = localStorage.getItem(DOCS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getChunksRaw(): DocumentChunk[] {
    if (!this.isBrowser()) return this.inMemoryChunks;
    try {
      const data = localStorage.getItem(CHUNKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getDocuments(): Document[] {
    try {
      const raw = this.getDocumentsRaw();
      const docs = raw.map((d: Document) => {
        if (!d.organizationId) d.organizationId = 'org-default';
        return d;
      });
      try {
        const activeOrgId = OrganizationManager.getInstance().getActiveOrgId();
        return docs.filter((d) => d.organizationId === activeOrgId);
      } catch {
        return docs;
      }
    } catch {
      return [];
    }
  }

  public getChunks(): DocumentChunk[] {
    try {
      const chunks = this.getChunksRaw();
      try {
        const docs = this.getDocuments();
        const docIds = new Set(docs.map((d) => d.id));
        return chunks.filter((c) => docIds.has(c.documentId));
      } catch {
        return chunks;
      }
    } catch {
      return [];
    }
  }

  private saveDocuments(docs: Document[]): void {
    if (!this.isBrowser()) {
      this.inMemoryDocs = docs;
      return;
    }
    try {
      localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error(e);
    }
  }

  private saveChunks(chunks: DocumentChunk[]): void {
    if (!this.isBrowser()) {
      this.inMemoryChunks = chunks;
      return;
    }
    try {
      localStorage.setItem(CHUNKS_KEY, JSON.stringify(chunks));
    } catch (e) {
      console.error(e);
    }
  }

  public indexDocument(document: Document, chunks: DocumentChunk[]): void {
    let activeOrgId = 'org-default';
    try {
      activeOrgId = OrganizationManager.getInstance().getActiveOrgId();
    } catch {
      // ignore
    }
    const documentWithOrg = { ...document, organizationId: activeOrgId };

    const docs = this.getDocumentsRaw();
    const existingChunks = this.getChunksRaw();

    const filteredDocs = docs.filter((d) => d.id !== document.id);
    const filteredChunks = existingChunks.filter((c) => c.documentId !== document.id);

    filteredDocs.unshift(documentWithOrg);
    filteredChunks.push(...chunks);

    this.saveDocuments(filteredDocs);
    this.saveChunks(filteredChunks);
  }

  public deleteDocument(documentId: string): void {
    const docs = this.getDocumentsRaw();
    const chunks = this.getChunksRaw();

    const filteredDocs = docs.filter((d) => d.id !== documentId);
    const filteredChunks = chunks.filter((c) => c.documentId !== documentId);

    this.saveDocuments(filteredDocs);
    this.saveChunks(filteredChunks);
  }

  public clearAll(): void {
    this.saveDocuments([]);
    this.saveChunks([]);
  }

  public searchKeyword(query: string, documentId?: string): { chunk: DocumentChunk; score: number }[] {
    const chunks = this.getChunks();
    const normalizedQuery = query.toLowerCase().trim();

    return chunks
      .filter((chunk) => {
        if (documentId && chunk.documentId !== documentId) return false;
        if (!normalizedQuery) return true;
        return chunk.content.toLowerCase().includes(normalizedQuery);
      })
      .map((chunk) => {
        let score = 0.4;
        if (normalizedQuery) {
          const content = chunk.content.toLowerCase();
          const count = (content.split(normalizedQuery).length - 1);

          if (content === normalizedQuery) {
            score = 1.0;
          } else if (content.startsWith(normalizedQuery)) {
            score = 0.9;
          } else if (count > 0) {
            score = Math.min(0.5 + count * 0.1, 0.85);
          }
        }
        return { chunk, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  public getIndexMetadata(): IndexMetadata {
    const docs = this.getDocuments();
    const chunks = this.getChunks();

    return {
      totalChunks: chunks.length,
      totalDocuments: docs.length,
      lastIndexedAt: new Date().toISOString(),
      provider: 'Local-In-Memory-Keyword',
    };
  }
}

export default ChunkIndexer;
