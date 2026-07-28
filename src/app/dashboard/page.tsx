'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Pause,
  Plus,
  Compass,
  Layout,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Activity,
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

export default function DashboardPage() {
  const { agents, addAgent, toggleAgentStatus } = useAgents();
  const { configs, activeProviderId } = useAIConfig();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Calculate metrics
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const inactiveAgents = agents.filter((a) => a.status === 'inactive').length;

  // AI metrics
  const activeConfigsList = Object.values(configs || {}) as ProviderConfig[];
  const enabledProvidersCount = activeConfigsList.filter((c: ProviderConfig) => c.enabled).length;
  const defaultProviderConfig = configs?.[activeProviderId];
  const defaultModelName = defaultProviderConfig?.selectedModelId || 'Não selecionado';

  // Recent agents (sorted by last updated, limit to 4)
  const recentAgents = [...agents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

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
                <h3 className="text-text-primary text-base font-bold">
                  Provedor Padrão Ativo: <span className="text-primary font-extrabold uppercase">{activeProviderId}</span>
                </h3>
                <p className="text-text-secondary text-xs max-w-xl leading-relaxed">
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

          <Card className="border-border bg-card p-5 flex flex-col justify-between">
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

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card 1: Total Agents */}
          <Card className="p-1">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Total de Agentes
                </CardTitle>
                <CardDescription className="text-text-muted text-[11px]">
                  Configurados no estúdio
                </CardDescription>
              </div>
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                <Cpu className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-text-primary text-3xl font-extrabold">{totalAgents}</span>
                <span className="text-text-muted text-xs">agentes</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Active Agents */}
          <Card className="p-1">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Agentes Ativos
                </CardTitle>
                <CardDescription className="text-text-muted text-[11px]">
                  Prontos para execução
                </CardDescription>
              </div>
              <div className="bg-success/10 text-success p-2.5 rounded-xl">
                <Play className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-success text-3xl font-extrabold">{activeAgents}</span>
                <span className="text-text-muted text-xs">ativos</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Inactive Agents */}
          <Card className="p-1">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                  Agentes Inativos
                </CardTitle>
                <CardDescription className="text-text-muted text-[11px]">
                  Em rascunho / pausados
                </CardDescription>
              </div>
              <div className="bg-neutral-light text-text-muted p-2.5 rounded-xl border border-border dark:bg-neutral-light/20">
                <Pause className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-3xl font-extrabold">{inactiveAgents}</span>
                <span className="text-text-muted text-xs">pausados</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activities split grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Agents Column (Spans 2 on large screens) */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-text-primary text-base font-bold tracking-tight flex items-center gap-2">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                      <div className="space-y-1 min-w-0">
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
                <div className="border-border bg-card rounded-xl border border-dashed p-10 text-center">
                  <Cpu className="h-8 w-8 text-text-muted mx-auto mb-3" />
                  <p className="text-text-primary text-sm font-medium">Nenhum agente configurado</p>
                  <p className="text-text-muted text-xs mt-1">Crie o seu primeiro agente para começar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-3.5">
            <h3 className="text-text-primary text-base font-bold tracking-tight flex items-center gap-2 px-1">
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

              <Link href="/agents" passHref legacyBehavior>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-primary" />
                    Abrir Playground
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>
              </Link>

              <Link href="/" passHref legacyBehavior>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full flex items-center justify-between border-border"
                >
                  <span className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-accent" />
                    Biblioteca de Design
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
            </Card>

            {/* Quick Tips */}
            <Card className="p-5 border-border/80 bg-neutral-light/20">
              <h4 className="text-text-primary text-xs font-bold tracking-wider uppercase mb-2">
                Dica de Produtividade
              </h4>
              <p className="text-text-secondary text-xs leading-relaxed">
                Você pode alternar o status ou duplicar agentes de forma rápida diretamente nas ações do Playground
                sem precisar recarregar a tela. Experimente o modo split-screen para editar o System Prompt enquanto visualiza os parâmetros do modelo.
              </p>
            </Card>
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
