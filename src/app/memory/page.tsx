'use client';

import React, { useState } from 'react';
import { Database, Plus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useMemoryStore } from '@/lib/memory/hooks';
import { MemoryItem, MemoryScope, MemoryCategory } from '@/lib/memory/types';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';

import {
  MemoryStatistics,
  MemoryToolbar,
  MemoryTimeline,
  MemoryEmptyState,
} from '@/components/memory';

export default function MemoryWorkspacePage() {
  const isMounted = useIsMounted();
  const { toast } = useToast();
  const { memories, stats, loading, addMemory, removeMemory, refresh } = useMemoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  // Form states
  const [newContent, setNewContent] = useState('');
  const [newScope, setNewScope] = useState<MemoryScope>('user');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('core_preference');
  const [newAgentId, setNewAgentId] = useState('');
  const [newTags, setNewTags] = useState('');

  // Handle Add memory submission
  const handleAddMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      toast('Campos obrigatórios', 'Por favor, preencha o conteúdo da memória.', 'warning');
      return;
    }

    try {
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const metadata: Record<string, string | number | boolean | string[] | undefined> = {
        tags: tagsArray,
      };

      if (newAgentId.trim()) {
        metadata.agentId = newAgentId.trim();
      }

      await addMemory(
        newContent,
        newScope,
        newCategory,
        metadata,
      );

      toast('Memória Registrada', 'Memória adicionada ao banco local com sucesso!', 'success');

      // Reset form
      setNewContent('');
      setNewAgentId('');
      setNewTags('');
      setIsAddModalOpen(false);
    } catch {
      toast('Erro', 'Ocorreu um erro ao salvar a memória cognitiva.', 'danger');
    }
  };

  // Handle single memory deletion
  const handleDeleteMemory = async (id: string) => {
    if (confirm('Deseja realmente remover permanentemente esta memória cognitiva?')) {
      try {
        await removeMemory(id);
        toast('Memória Removida', 'A memória foi excluída com sucesso.', 'info');
      } catch {
        toast('Erro', 'Falha ao remover memória cognitiva.', 'danger');
      }
    }
  };

  // Handle Clear Storage Database
  const handleClearDatabase = async () => {
    if (
      confirm(
        'ATENÇÃO: Isso irá limpar TODAS as memórias locais armazenadas. Esta ação é irreversível. Deseja prosseguir?',
      )
    ) {
      const { MemoryStorage } = await import('@/lib/memory/storage/MemoryStorage');
      MemoryStorage.getInstance().clear();
      toast('Banco de Dados Limpo', 'O banco de dados de memórias foi limpo com sucesso.', 'warning');
      await refresh();
    }
  };

  // View memory details
  const handleSelectMemory = (memory: MemoryItem) => {
    setSelectedMemory(memory);
    setIsDetailModalOpen(true);
  };

  // Filter memories matching search state
  const filteredMemories = memories.filter((mem) => {
    // Search filter
    if (searchQuery.trim()) {
      const normQuery = searchQuery.toLowerCase().trim();
      const contentMatch = mem.content.toLowerCase().includes(normQuery);
      const tagMatch = mem.metadata.tags?.some((t) => t.toLowerCase().includes(normQuery));
      if (!contentMatch && !tagMatch) return false;
    }

    // Scope filter
    if (selectedScope !== 'all' && mem.scope !== selectedScope) return false;

    // Category filter
    if (selectedCategory !== 'all' && mem.category !== selectedCategory) return false;

    return true;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedScope('all');
    setSelectedCategory('all');
  };

  // Safe hydration check
  if (!isMounted) {
    return null;
  }

  return (
    <WorkspaceLayout
      activePath="memory"
      title="Gerenciamento de Memória"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Memória Cognitiva' }]}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Banner Intro */}
        <div className="border-border bg-gradient-to-tr from-indigo-500/10 via-transparent to-accent/5 rounded-2xl border p-6 shadow-xs select-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Database className="h-4 w-4" />
                SISTEMA DE MEMÓRIA COGNITIVA
              </span>
              <h2 className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
                Memórias Curtas e Longas locais
              </h2>
              <p className="text-text-secondary text-sm max-w-3xl leading-relaxed">
                Essa tela gerencia as preferências persistentes do usuário, fatos semânticos globais, e
                histórico conversacional de curto prazo. O AI Gateway recupera esses contextos e os injeta de forma
                transparente no System Prompt das inferências.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4.5 w-4.5" />}
              onClick={() => setIsAddModalOpen(true)}
              className="shrink-0"
            >
              Nova Memória
            </Button>
          </div>
        </div>

        {/* Statistics Grid */}
        <MemoryStatistics stats={stats} loading={loading} />

        {/* Toolbar */}
        <MemoryToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedScope={selectedScope}
          onScopeChange={setSelectedScope}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onCreateMemoryClick={() => setIsAddModalOpen(true)}
          onClearAllClick={handleClearDatabase}
        />

        {/* Content feed - Chronological timeline layout */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              Linha do Tempo das Memórias
            </h3>
            <span className="text-text-muted text-xs font-semibold">
              Exibindo {filteredMemories.length} registros
            </span>
          </div>

          {filteredMemories.length > 0 ? (
            <MemoryTimeline
              memories={filteredMemories}
              onDelete={handleDeleteMemory}
              onSelect={handleSelectMemory}
            />
          ) : (
            <MemoryEmptyState
              onClearFilters={handleClearFilters}
              onCreateMemory={() => setIsAddModalOpen(true)}
              isSearchActive={!!searchQuery || selectedScope !== 'all' || selectedCategory !== 'all'}
            />
          )}
        </div>
      </div>

      {/* MODAL 1: ADD MEMORY */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrar Nova Memória Cognitiva"
      >
        <form onSubmit={handleAddMemorySubmit} className="space-y-4 text-left select-none">
          <div className="space-y-1.5">
            <label className="text-text-secondary text-xs font-bold uppercase">
              Conteúdo da Memória *
            </label>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Ex: O usuário trabalha principalmente com Node.js e prefere queries SQL parametrizadas..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-text-secondary text-xs font-bold uppercase">
                Escopo
              </label>
              <Select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as MemoryScope)}
              >
                <option value="user">Usuário (User)</option>
                <option value="project">Projeto (Project)</option>
                <option value="agent">Agente (Agent)</option>
                <option value="conversation">Conversa (Conversation)</option>
                <option value="global">Global</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary text-xs font-bold uppercase">
                Categoria
              </label>
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
              >
                <option value="core_preference">Preferência Core</option>
                <option value="user_info">Dados do Usuário</option>
                <option value="context_history">Histórico de Contexto</option>
                <option value="semantic_fact">Fato Semântico</option>
                <option value="other">Outro</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-text-secondary text-xs font-bold uppercase">
                ID do Agente (Opcional)
              </label>
              <Input
                type="text"
                value={newAgentId}
                onChange={(e) => setNewAgentId(e.target.value)}
                placeholder="Ex: agent-1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary text-xs font-bold uppercase">
                Tags (Separadas por vírgula)
              </label>
              <Input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Ex: sql, preferência, dados"
              />
            </div>
          </div>

          <div className="border-border/60 border-t pt-4 mt-6 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Check className="h-4 w-4" />}>
              Adicionar Memória
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: MEMORY DETAILS VIEW */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes da Memória Cognitiva"
      >
        {selectedMemory && (
          <div className="space-y-5 text-left select-none">
            {/* Display complete properties */}
            <div className="bg-neutral-light/30 border border-border/60 rounded-xl p-4">
              <p className="text-text-primary text-sm font-medium leading-relaxed whitespace-pre-wrap">
                &quot;{selectedMemory.content}&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div className="space-y-0.5">
                <span className="text-text-muted font-bold uppercase text-[10px]">ID Interno</span>
                <p className="text-text-primary font-mono bg-neutral-light/50 px-2 py-0.5 rounded-sm inline-block">
                  {selectedMemory.id}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted font-bold uppercase text-[10px]">Tipo de Armazenamento</span>
                <p className="text-text-primary capitalize font-semibold">{selectedMemory.type}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted font-bold uppercase text-[10px]">Escopo de Injeção</span>
                <p className="text-text-primary capitalize font-semibold">{selectedMemory.scope}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted font-bold uppercase text-[10px]">Categoria Semântica</span>
                <p className="text-text-primary capitalize font-semibold">
                  {selectedMemory.category.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted font-bold uppercase text-[10px]">Criado em</span>
                <p className="text-text-secondary">
                  {new Date(selectedMemory.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-text-muted font-bold uppercase text-[10px]">Último Acesso</span>
                <p className="text-text-secondary">
                  {selectedMemory.lastAccessedAt
                    ? new Date(selectedMemory.lastAccessedAt).toLocaleString('pt-BR')
                    : 'Ainda não acessado'}
                </p>
              </div>
            </div>

            {selectedMemory.metadata.tags && selectedMemory.metadata.tags.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-text-muted font-bold uppercase text-[10px]">Palavras-Chave (Tags)</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMemory.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/10 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-border/60 border-t pt-4 mt-6 flex justify-end gap-2.5">
              {selectedMemory.metadata.agentId && (
                <a
                  href={`/agents?select=${selectedMemory.metadata.agentId}`}
                  className="mr-auto inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold"
                >
                  Ver Agente Relacionado
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Fechar Detalhes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </WorkspaceLayout>
  );
}
