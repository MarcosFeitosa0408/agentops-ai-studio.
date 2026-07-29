'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Activity,
  Database,
  BookOpen,
  Heart,
  FileText,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';

import { useAgents } from '@/context/AgentContext';
import { Agent } from '@/types/agent';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { CreateAgentModal } from '@/components/agents/CreateAgentModal';
import { AgentStatusBadge } from '@/components/agents/AgentStatusBadge';
import { useAIConfig } from '../../lib/ai/hooks/useAIConfig';
import { ProviderConfig } from '../../lib/ai/types';
import { useIsMounted } from '@/hooks/useIsMounted';

// Import local systems managers with relative paths to avoid any Turbopack alias quirks
import { MemoryStorage } from '../../lib/memory/storage/MemoryStorage';
import { ChunkIndexer } from '../../lib/rag/indexers/ChunkIndexer';
import { MemoryItem } from '../../lib/memory/types';
import { Document } from '../../lib/rag/types';

export default function DashboardPage() {
  const isMounted = useIsMounted();
  const { agents, addAgent, toggleAgentStatus } = useAgents();
  const { configs, activeProviderId } = useAIConfig();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // States for Cognitive / RAG parameters
  const [memoryCount, setMemoryCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [recentMemories, setRecentMemories] = useState<MemoryItem[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);

  // Load Cognitive / RAG data safely
  useEffect(() => {
    if (isMounted) {
      try {
        const mStorage = MemoryStorage.getInstance();
        const rIndexer = ChunkIndexer.getInstance();

        const mStats = mStorage.statistics();
        const rStats = rIndexer.getIndexMetadata();
        const listMems = mStorage.list().slice(0, 3);
        const listDocs = rIndexer.getDocuments().slice(0, 3);

        setTimeout(() => {
          setMemoryCount(mStats.totalCount);
          setDocumentCount(rStats.totalDocuments);
          setRecentMemories(listMems);
          setRecentDocuments(listDocs);
        }, 0);
      } catch (err) {
        console.error('Failed to load dashboard metrics from local storage:', err);
      }
    }
  }, [isMounted]);

  // AI metrics
  const activeConfigsList = Object.values(configs || {}) as ProviderConfig[];
  const enabledProvidersCount = activeConfigsList.filter((c: ProviderConfig) => c.enabled).length;
  const defaultProviderConfig = configs?.[activeProviderId];
  const defaultModelName = defaultProviderConfig?.selectedModelId || 'Não selecionado';

  // Recent agents (sorted by last updated, limit to 3)
  const recentAgents = [...agents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const handleCreateAgent = (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    addAgent(data);
    setIsCreateModalOpen(false);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <WorkspaceLayout
      activePath="dashboard"
      title="Visão Geral do Estúdio"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Dashboard' }]}
      onCreateAgentClick={() => setIsCreateModalOpen(true)}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Intro Banner */}
        <div className="border-border bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 rounded-2xl border p-6 md:p-8 shadow-xs select-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
                Bem-vindo ao AgentOps AI Studio!
              </h2>
              <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
                Gerencie, configure e refine seus agentes de IA especializados de forma visual e intuitiva.
                Utilize o painel abaixo para monitorar suas instâncias ou criar novos assistentes.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4.5 w-4.5" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="shrink-0"
            >
              Criar Agente
            </Button>
          </div>
        </div>

        {/* AI Gateway Overview Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 animate-pulse" />
                  Status do AI Gateway
                </span>
                <h3 className="text-text-primary text-base font-bold text-left">
                  Provedor Padrão Ativo: <span className="text-primary font-extrabold uppercase">{activeProviderId}</span>
                </h3>
                <p className="text-text-secondary text-xs max-w-xl leading-relaxed text-left">
                  Todas as inferências de agentes cognitivos no estúdio estão sendo roteadas pelo gateway inteligente utilizando o modelo de linguagem <strong className="text-text-primary">{defaultModelName}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right select-none hidden sm:block">
                  <div className="text-xs text-text-muted">Provedores Ativos</div>
                  <div className="text-sm font-bold text-success">{enabledProvidersCount} de 6</div>
                </div>
                <Link href="/settings" passHref legacyBehavior>
                  <Button variant="outline" size="sm">
                    Configurar AI
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5 flex flex-col justify-between text-left">
            <div className="space-y-1">
              <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Playground Direto
              </span>
              <p className="text-text-primary text-sm font-bold">Inicie um Teste Rápido</p>
              <p className="text-text-muted text-xs leading-normal">
                Experimente o comportamento heurístico dos modelos disponíveis antes de atribuí-los a um agente.
              </p>
            </div>
            <Link href="/playground" passHref legacyBehavior>
              <Button variant="secondary" size="xs" className="w-full mt-3">
                Abrir Playground de Chat
              </Button>
            </Link>
          </Card>
        </div>

        {/* Part 12 — Sprint 5 Dashboard KPI Cards Integration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Stored Memories */}
          <Card className="p-1">
            <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5 text-left">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Memórias Salvas
                </CardTitle>
                <CardDescription className="text-text-muted text-[10px]">
                  Fatos locais no Memory Store
                </CardDescription>
              </div>
              <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl border border-indigo-500/10">
                <Database className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 select-none text-left">
              <div className="flex items-baseline gap-1.5">
                <span className="text-text-primary text-2xl font-extrabold">{memoryCount}</span>
                <span className="text-text-muted text-xs">registros</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Indexed Documents */}
          <Card className="p-1">
            <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5 text-left">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Docs Indexados
                </CardTitle>
                <CardDescription className="text-text-muted text-[10px]">
                  Documentos no RAG Engine
                </CardDescription>
              </div>
              <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/10">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 select-none text-left">
              <div className="flex items-baseline gap-1.5">
                <span className="text-text-primary text-2xl font-extrabold">{documentCount}</span>
                <span className="text-text-muted text-xs">arquivos</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Memory Health */}
          <Card className="p-1">
            <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5 text-left">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Saúde do Contexto
                </CardTitle>
                <CardDescription className="text-text-muted text-[10px]">
                  Estabilidade cognitiva local
                </CardDescription>
              </div>
              <div className="bg-rose-500/10 text-rose-500 p-2 rounded-xl border border-rose-500/10">
                <Heart className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 select-none text-left">
              <div className="flex items-baseline gap-1.5">
                <span className="text-rose-500 text-2xl font-extrabold">100%</span>
                <span className="text-text-muted text-xs">estável</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Knowledge Base Link / Status */}
          <Card className="p-1">
            <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5 text-left">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Base de Conhecimento
                </CardTitle>
                <CardDescription className="text-text-muted text-[10px]">
                  RAG pipeline pronto
                </CardDescription>
              </div>
              <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl border border-amber-500/10">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 select-none text-left flex items-center justify-between">
              <span className="text-text-primary text-xs font-bold bg-neutral-light/50 px-2 py-0.5 rounded-sm">
                Conectado
              </span>
              <Link href="/knowledge" passHref legacyBehavior>
                <a className="text-primary hover:text-primary-hover text-[11px] font-bold inline-flex items-center gap-0.5">
                  Ver Base
                  <ChevronRight className="h-3 w-3" />
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Split Grid: Left 2 columns (Recent items & Agents) - Right 1 column (Recent Memories feed) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Agents column (Spans 2 on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Agents section */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-primary animate-pulse" />
                  Agentes Atualizados Recentemente
                </h3>
                <Link href="/agents" passHref legacyBehavior>
                  <a className="text-primary hover:text-primary-hover text-xs font-semibold inline-flex items-center gap-0.5">
                    Ver todos os agentes
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </Link>
              </div>

              <div className="space-y-3">
                {recentAgents.length > 0 ? (
                  recentAgents.map((agent) => (
                    <Card
                      key={agent.id}
                      className="hover:border-primary/25 border-border transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5">
                        <div className="space-y-1 min-w-0 text-left">
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-text-primary text-sm font-bold tracking-tight truncate">
                              {agent.name}
                            </h4>
                            <Badge variant="outline" size="sm" className="bg-neutral-light/30">
                              {agent.specialty}
                            </Badge>
                          </div>
                          <p className="text-text-secondary text-xs line-clamp-1">
                            {agent.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted pt-0.5">
                            <span>Última atualização: {formatDate(agent.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <AgentStatusBadge status={agent.status} />
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => toggleAgentStatus(agent.id)}
                              className={agent.status === 'active' ? 'text-text-secondary' : 'text-success'}
                            >
                              {agent.status === 'active' ? 'Pausar' : 'Ativar'}
                            </Button>
                            <Link href={`/agents?select=${agent.id}`} passHref legacyBehavior>
                              <Button variant="secondary" size="xs">
                                Configurar
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="border-border bg-card rounded-xl border border-dashed p-10 text-center select-none">
                    <Cpu className="h-8 w-8 text-text-muted mx-auto mb-3" />
                    <p className="text-text-primary text-sm font-medium">Nenhum agente configurado</p>
                    <p className="text-text-muted text-xs mt-1">Crie o seu primeiro agente para começar.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Part 12 — Recent Documents List Card */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-accent" />
                  Documentos de Conhecimento Indexados
                </h3>
                <Link href="/knowledge" passHref legacyBehavior>
                  <a className="text-primary hover:text-primary-hover text-xs font-semibold inline-flex items-center gap-0.5">
                    Ver Base RAG
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentDocuments.map((doc) => (
                  <Card key={doc.id} className="p-4 flex flex-col justify-between h-32 hover:border-primary/20 transition-all select-none">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary font-mono uppercase">
                          {doc.type}
                        </span>
                        <span className="text-[10px] text-text-muted">{doc.chunksCount} chunks</span>
                      </div>
                      <h4 className="text-text-primary text-xs font-bold truncate tracking-tight pt-1">
                        {doc.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-text-muted pt-2 border-t border-border/40">
                      <span>{formatDate(doc.createdAt).split(' ')[0]}</span>
                      <Link href="/knowledge" passHref legacyBehavior>
                        <a className="text-primary font-semibold">Preview</a>
                      </Link>
                    </div>
                  </Card>
                ))}
                {recentDocuments.length === 0 && (
                  <div className="col-span-3 border border-dashed border-border p-8 text-center text-text-muted rounded-xl bg-card">
                    Nenhum documento indexado na base.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Part 12 — Recent Memories list & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Memories column list */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <Database className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                  Memórias Recentes
                </h3>
                <Link href="/memory" passHref legacyBehavior>
                  <a className="text-primary hover:text-primary-hover text-xs font-semibold inline-flex items-center gap-0.5">
                    Ver todas
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </Link>
              </div>

              <Card className="p-4 space-y-4 select-none">
                {recentMemories.map((mem) => (
                  <div key={mem.id} className="text-left space-y-1 pb-3 last:pb-0 border-b last:border-0 border-border/30">
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className="bg-indigo-500/10 text-indigo-500 px-1.5 py-0.2 rounded-xs uppercase">
                        {mem.scope}
                      </span>
                      <span className="text-text-muted">{formatDate(mem.createdAt).split(' ')[0]}</span>
                    </div>
                    <p className="text-text-primary text-xs leading-normal line-clamp-2">
                      &quot;{mem.content}&quot;
                    </p>
                  </div>
                ))}
                {recentMemories.length === 0 && (
                  <p className="text-text-muted text-xs text-center py-4">
                    Nenhuma memória local ativa.
                  </p>
                )}
              </Card>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-3.5">
              <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2 px-1">
                <TrendingUp className="h-4.5 w-4.5 text-accent" />
                Ações Rápidas
              </h3>

              <Card className="p-4 space-y-3.5">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-between"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Agente de IA
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>

                <Link href="/memory" passHref legacyBehavior>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-indigo-500" />
                      Memória Cognitiva
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </Button>
                </Link>

                <Link href="/knowledge" passHref legacyBehavior>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full flex items-center justify-between border-border"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      Conhecimento RAG
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAgent}
      />
    </WorkspaceLayout>
  );
}
