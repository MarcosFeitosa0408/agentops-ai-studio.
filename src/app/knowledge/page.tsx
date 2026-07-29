'use client';

import React, { useState } from 'react';
import { BookOpen, Search, HelpCircle, RefreshCw } from 'lucide-react';
import { useRAGStore } from '@/lib/rag/hooks';
import { SupportedDocumentType, SearchResult } from '@/lib/rag/types';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

import {
  IndexStatus,
  KnowledgeSidebar,
  DocumentUploader,
  ChunkViewer,
  SearchResults,
} from '@/components/rag';

export default function KnowledgeBasePage() {
  const isMounted = useIsMounted();
  const { toast } = useToast();
  const {
    documents,
    chunks,
    metadata,
    loading,
    addDocument,
    removeDocument,
    searchChunks,
  } = useRAGStore();

  const [selectedDocId, setSelectedDocId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected document helper
  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;
  const selectedDocChunks = selectedDoc
    ? chunks.filter((c) => c.documentId === selectedDoc.id)
    : [];

  // Handle mock document uploads
  const handleUploadDocument = async (
    name: string,
    type: SupportedDocumentType,
    size: number,
    content?: string,
  ) => {
    try {
      const result = await addDocument(name, type, size, content);
      toast(
        'Documento Indexado',
        `O arquivo "${result.document.name}" foi parseado em ${result.chunks.length} retalhos locais.`,
        'success',
      );
      if (result.document.id) {
        setSelectedDocId(result.document.id);
      }
    } catch {
      toast('Erro de Parsing', 'Falha ao processar o arquivo simulado.', 'danger');
    }
  };

  // Handle document deletions
  const handleDeleteDocument = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    const docName = doc ? doc.name : 'documento';
    if (confirm(`Deseja realmente excluir permanentemente "${docName}" do índice de conhecimento?`)) {
      try {
        await removeDocument(id);
        toast('Documento Removido', `O arquivo "${docName}" foi desindexado com sucesso.`, 'info');
        if (selectedDocId === id) {
          setSelectedDocId('');
        }
      } catch {
        toast('Erro', 'Falha ao remover documento.', 'danger');
      }
    }
  };

  // Handle live context searches
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Simulate micro latency for realistic semantic retrieval feedback
      const matched = await searchChunks(val);
      setSearchResults(matched);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // Safe hydration check
  if (!isMounted) {
    return null;
  }

  return (
    <WorkspaceLayout
      activePath="knowledge"
      title="Base de Conhecimento RAG"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Conhecimento RAG' }]}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Intro banner */}
        <div className="border-border bg-gradient-to-tr from-emerald-500/10 via-transparent to-accent/5 rounded-2xl border p-6 shadow-xs select-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                RETRIEVAL-AUGMENTED GENERATION (RAG)
              </span>
              <h2 className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
                Biblioteca de Documentos Corporativos
              </h2>
              <p className="text-text-secondary text-sm max-w-3xl leading-relaxed">
                Carregue e organize guias de compliance, contratos e manuais operacionais. O mecanismo RAG do
                estúdio divide automaticamente os arquivos em retalhos (chunks) e realiza buscas semânticas em tempo
                de inferência, reduzindo alucinações e provendo citações confiáveis.
              </p>
            </div>
          </div>
        </div>

        {/* Index statistics overview */}
        <IndexStatus metadata={metadata} loading={loading} />

        {/* Main Work Area split grid (Left: Sidebar lists, Right: Uploader, Searcher, Viewer) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Knowledge base Sidebar list */}
          <div className="lg:col-span-1 space-y-4">
            <KnowledgeSidebar
              documents={documents}
              selectedDocumentId={selectedDocId || (documents[0]?.id || '')}
              onDocumentSelect={(doc) => setSelectedDocId(doc.id)}
              onDocumentDelete={handleDeleteDocument}
              loading={loading}
            />

            {/* Quick Helper Box */}
            <Card className="p-4 bg-neutral-light/10 border-border/80 text-left select-none space-y-2.5">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                Como o RAG funciona?
              </span>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                1. <strong>Chunking:</strong> Seu documento é quebrado em pequenos parágrafos focados.<br />
                2. <strong>Vectorization:</strong> Cada parágrafo será convertido em vetores no futuro Sprint.<br />
                3. <strong>Retrieval:</strong> Quando o usuário envia mensagens à IA, os trechos mais correspondentes
                são pinçados no banco de vetores e injetados de forma a enriquecer o contexto cognitivo do agente.
              </p>
            </Card>
          </div>

          {/* Right Column: Interactive panels */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Uploader */}
            <DocumentUploader onUpload={handleUploadDocument} />

            {/* 2. Interactive Semantic Search */}
            <div className="bg-card border-border rounded-2xl border p-5 space-y-4">
              <div className="space-y-1.5 text-left flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary text-xs font-bold uppercase tracking-wider">
                    Testar Recuperação Semântica (RAG Engine Query)
                  </h3>
                  <p className="text-text-muted text-[11px]">
                    Simule como o AI Gateway recuperará e ranqueará citações em tempo real de acordo com as perguntas dos agentes.
                  </p>
                </div>
                {searching && (
                  <RefreshCw className="h-4 w-4 text-primary animate-spin shrink-0" />
                )}
              </div>

              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <Input
                  type="text"
                  placeholder="Pesquise por conceitos (Ex: 'LGPD', 'SLA', 'Temperatura 0.0', 'queries SQL')..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Retrieval Results feed */}
              <SearchResults results={searchResults} query={searchQuery} />
            </div>

            {/* 3. Document Chunk Preview */}
            {selectedDoc ? (
              <div className="bg-card border-border rounded-2xl border p-5">
                <ChunkViewer
                  chunks={selectedDocChunks}
                  documentName={selectedDoc.name}
                  loading={loading}
                />
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-2xl p-8 text-center text-text-muted bg-card">
                <p className="text-xs">Selecione ou faça upload de um documento para visualizar a estrutura de chunks parseados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
