import { ChunkIndexer } from '../indexers/ChunkIndexer';
import { SearchResult, SourceReference } from '../types';

export class RetrievalService {
  private static instance: RetrievalService;
  private indexer: ChunkIndexer;

  private constructor() {
    this.indexer = ChunkIndexer.getInstance();
  }

  public static getInstance(): RetrievalService {
    if (!RetrievalService.instance) {
      RetrievalService.instance = new RetrievalService();
    }
    return RetrievalService.instance;
  }

  public async retrieve(
    query: string,
    filters?: { documentId?: string; minScore?: number; limit?: number },
  ): Promise<SearchResult[]> {
    console.log(`[RetrievalService] Retrieving chunks matching query: "${query}"`);

    const limit = filters?.limit ?? 3;
    const minScore = filters?.minScore ?? 0.1;

    const matches = this.indexer.searchKeyword(query, filters?.documentId);
    const documents = this.indexer.getDocuments();

    const searchResults: SearchResult[] = matches
      .map((match) => {
        const doc = documents.find((d) => d.id === match.chunk.documentId);
        const docName = doc ? doc.name : 'Documento Desconhecido';

        const reference: SourceReference = {
          documentId: match.chunk.documentId,
          documentName: docName,
          chunkId: match.chunk.id,
          content: match.chunk.content,
          pageNumber: match.chunk.metadata.pageNumber,
          score: match.score,
        };

        return {
          chunk: match.chunk,
          score: match.score,
          reference,
        };
      })
      .filter((res) => res.score >= minScore);

    const ranked = this.rank(searchResults);
    return ranked.slice(0, limit);
  }

  public async search(query: string, documentId?: string, limit: number = 5): Promise<SearchResult[]> {
    return this.retrieve(query, { documentId, limit });
  }

  public rank(results: SearchResult[]): SearchResult[] {
    return [...results].sort((a, b) => b.score - a.score);
  }

  public async getRelevantContext(query: string, documentId?: string, limit: number = 2): Promise<string> {
    const results = await this.retrieve(query, { documentId, limit });

    if (results.length === 0) {
      return '';
    }

    const contextLines = results.map((res, idx) => {
      const pageStr = res.reference.pageNumber ? `, pág. ${res.reference.pageNumber}` : '';
      return `[Documento Relacionado #${idx + 1}] "${res.reference.documentName}"${pageStr} (Relevância: ${(res.score * 100).toFixed(0)}%): "${res.chunk.content}"`;
    });

    return `\n--- CONTEXTO DE DOCUMENTOS DE CONHECIMENTO RECUPERADOS ---\n${contextLines.join('\n')}\n----------------------------------------------------\n`;
  }
}

export default RetrievalService;
