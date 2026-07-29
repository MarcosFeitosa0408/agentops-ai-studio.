import { useState, useEffect, useCallback } from 'react';
import { ChunkIndexer } from '../indexers/ChunkIndexer';
import { RetrievalService } from '../services/RetrievalService';
import { DocumentParser } from '../parsers/DocumentParser';
import { Document, DocumentChunk, IndexMetadata, SupportedDocumentType } from '../types';

export function useRAGStore() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [metadata, setMetadata] = useState<IndexMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const indexer = ChunkIndexer.getInstance();
      const currentDocs = indexer.getDocuments();
      const currentChunks = indexer.getChunks();
      const currentIndexMetadata = indexer.getIndexMetadata();

      setTimeout(() => {
        setDocuments(currentDocs);
        setChunks(currentChunks);
        setMetadata(currentIndexMetadata);
        setLoading(false);
      }, 0);
    } catch (e) {
      console.error(e);
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

  const addDocument = async (
    name: string,
    type: SupportedDocumentType,
    size: number,
    customContent?: string,
  ) => {
    const indexer = ChunkIndexer.getInstance();
    const { document, chunks: docChunks } = DocumentParser.parse(name, type, size, customContent);
    indexer.indexDocument(document, docChunks);
    await refresh();
    return { document, chunks: docChunks };
  };

  const removeDocument = async (id: string) => {
    const indexer = ChunkIndexer.getInstance();
    indexer.deleteDocument(id);
    await refresh();
  };

  const searchChunks = async (query: string, documentId?: string) => {
    const retriever = RetrievalService.getInstance();
    return retriever.search(query, documentId);
  };

  return {
    documents,
    chunks,
    metadata,
    loading,
    refresh,
    addDocument,
    removeDocument,
    searchChunks,
  };
}
