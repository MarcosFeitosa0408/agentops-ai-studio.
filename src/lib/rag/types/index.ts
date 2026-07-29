export type SupportedDocumentType = 'PDF' | 'DOCX' | 'TXT' | 'Markdown' | 'CSV' | 'Excel' | 'JSON';

export interface ChunkMetadata {
  documentId: string;
  pageNumber?: number;
  lineNumber?: number;
  sectionTitle?: string;
  wordCount: number;
  [key: string]: string | number | boolean | undefined;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: ChunkMetadata;
  embeddingId?: string;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: SupportedDocumentType;
  content: string;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'parsing' | 'indexed' | 'failed';
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    createdDate?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface EmbeddingPlaceholder {
  id: string;
  vector: number[];
  model: string;
  dimensions: number;
}

export interface IndexMetadata {
  totalChunks: number;
  totalDocuments: number;
  lastIndexedAt: string;
  provider: string;
}

export interface SourceReference {
  documentId: string;
  documentName: string;
  chunkId: string;
  content: string;
  pageNumber?: number;
  score: number;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  reference: SourceReference;
}
