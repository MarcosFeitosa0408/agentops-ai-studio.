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
  Cpu,
  Wrench,
  CheckCircle,
  Zap,
  GitBranch,
} from 'lucide-react';
import Link from 'next/link';

import { useAgents } from '@/context/AgentContext';
import { Agent } from '@/types/agent';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { CreateAgentModal } from '../../components/agents/CreateAgentModal';
import { AgentStatusBadge } from '../../components/agents/AgentStatusBadge';
import { useAIConfig } from '../../lib/ai/hooks/useAIConfig';
import { ProviderConfig } from '../../lib/ai/types';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RouteProtection } from '../../components/security/RouteProtection';

// Local systems managers
import { MemoryStorage } from '../../lib/memory/storage/MemoryStorage';
import { ToolExecutionService } from '../../lib/tools/services/ToolExecutionService';
import { ExecutionMonitor } from '../../lib/workflows/services/ExecutionMonitor';
import { WorkflowLogService } from '../../lib/workflows/services/WorkflowLogService';
import { MemoryItem } from '../../lib/memory/types';
import { ToolStatus, ToolResult } from '../../lib/tools/types';
import { WorkflowStatistics, WorkflowLog } from '../../lib/workflows/types';
import { ExecutionTimeline } from '../../components/tools/TimelineComponents';

interface TimelineStepData {
  toolId: string;
  toolName: string;
  iconName: string;
  reason: string;
  durationMs: number;
  status: ToolStatus;
  input: Record<string, unknown>;
  output?: ToolResult;
}

export default function DashboardPage() {
  const isMounted = useIsMounted();
  const { agents, addAgent, toggleAgentStatus } = useAgents();
  const { configs, activeProviderId } = useAIConfig();
  const { activeWorkspace } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // States for Cognitive / RAG / Executions parameters
  const [recentMemories, setRecentMemories] = useState<MemoryItem[]>([]);

  // Tool Execution Metrics state
  const [execMetrics, setExecMetrics] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageLatencyMs: 0,
    mostUsedToolId: 'N/A',
  });
  const [dashboardTimeline, setDashboardTimeline] = useState<TimelineStepData[]>([]);

  // Workflow Metrics state (Sprint 7 Part 9)
  const [wfStats, setWfStats] = useState<WorkflowStatistics | null>(null);
  const [recentWfLogs, setRecentWfLogs] = useState<WorkflowLog[]>([]);

  // Load Cognitive / RAG / Tools Executions safely
  useEffect(() => {
    if (isMounted) {
      try {
        const mStorage = MemoryStorage.getInstance();
        const execService = ToolExecutionService.getInstance();
        const monitorService = ExecutionMonitor.getInstance();
        const wfLogService = WorkflowLogService.getInstance();

        const listMems = mStorage.list().slice(0, 3);

        const metrics = execService.getMetrics();
        const logs = execService.getLogs().slice(0, 2);

        // Convert tool logs to timeline steps format
        const registry = execService.getRegistry();
        const timelineSteps = logs.map((log) => {
          const toolMeta = registry.find(log.toolId);
          return {
            toolId: log.toolId,
            toolName: toolMeta?.name || log.toolId,
            iconName: toolMeta?.icon || 'Terminal',
            reason: `Dispatched contextual operation pipeline from agent ${log.agentId || 'System'}`,
            durationMs: log.durationMs || 12,
            status: log.status,
            input: log.input,
            output: log.output,
          };
        });

        const computedWfStats = monitorService.getStatistics();
        const listWfLogs = wfLogService.list().slice(0, 3);

        setTimeout(() => {
          setRecentMemories(listMems);
          setExecMetrics(metrics);
          setDashboardTimeline(timelineSteps);
          setWfStats(computedWfStats);
          setRecentWfLogs(listWfLogs);
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

  // Workspace-based dynamic agent isolation
  const workspaceIsolatedAgents = agents.filter((agent) => {
    if (!activeWorkspace) return true;
    const dept = activeWorkspace.department;
    if (dept === 'Finance') {
      return ['Finance', 'Business Intelligence', 'Data Science'].includes(agent.specialty);
    }
    if (dept === 'Marketing') {
      return ['Data Science', 'Human Resources', 'Legal & Compliance'].includes(agent.specialty);
    }
    if (dept === 'Engineering') {
      return ['Database Operations', 'Data Science', 'Business Intelligence'].includes(agent.specialty);
    }
    return true;
  });

  // Recent isolated agents
  const recentAgents = [...workspaceIsolatedAgents]
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
    <RouteProtection>
      <WorkspaceLayout
        activePath="dashboard"
        title="Visão Geral do Estúdio"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Dashboard' }]}
        onCreateAgentClick={() => setIsCreateModalOpen(true)}
      >
        <div className="space-y-8 max-w-7xl mx-auto text-left">
          {/* Intro Banner */}
          <div className="border-border bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 rounded-2xl border p-6 md:p-8 shadow-xs select-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
                  Bem-vindo ao AgentOps AI Studio!
                </h2>
                {activeWorkspace && (
                  <div className="inline-flex items-center gap-1 bg-violet-500/10 text-violet-400 font-bold text-xs px-2.5 py-0.5 rounded-full mb-2">
                    Workspace Ativo: {activeWorkspace.name}
                  </div>
                )}
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

          {/* Sprint 7 Part 9: Integrated Workflow automation stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Workflows Ativos
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Processando em segundo plano
                  </CardDescription>
                </div>
                <div className="bg-success/10 text-success p-2 rounded-xl">
                  <GitBranch className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">
                    {wfStats?.activeWorkflows || 0}
                  </span>
                  <span className="text-text-muted text-xs">ativos</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Rodadas de Workflow
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Execuções concluídas
                  </CardDescription>
                </div>
                <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl">
                  <Activity className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">
                    {wfStats?.totalExecutions || 0}
                  </span>
                  <span className="text-text-muted text-xs">rodadas</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Taxa de Sucesso (WF)
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Assertividade das regras
                  </CardDescription>
                </div>
                <div className="bg-success/10 text-success p-2 rounded-xl">
                  <CheckCircle className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-success text-2xl font-extrabold">
                    {wfStats?.successRate || 100}%
                  </span>
                  <span className="text-text-muted text-xs">sucesso</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Duração Média (WF)
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Latência ponta-a-ponta
                  </CardDescription>
                </div>
                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">
                    {wfStats?.averageDurationMs || 0}
                  </span>
                  <span className="text-text-muted text-xs">ms</span>
                </div>
                <Link href="/workflows" passHref legacyBehavior>
                  <a className="text-primary hover:text-primary-hover text-[11px] font-bold inline-flex items-center gap-0.5">
                    Ver Canvas
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Cognitive & Tools Engine KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Executions */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Total de Execuções
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Ferramentas acionadas hoje
                  </CardDescription>
                </div>
                <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/10">
                  <Wrench className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">{execMetrics.totalExecutions}</span>
                  <span className="text-text-muted text-xs">rodadas</span>
                </div>
              </CardContent>
            </Card>

            {/* Success Executions */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Execuções de Sucesso
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Concluídas sem erros
                  </CardDescription>
                </div>
                <div className="bg-success/10 text-success p-2 rounded-xl border border-success/10">
                  <CheckCircle className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-success text-2xl font-extrabold">{execMetrics.successfulExecutions}</span>
                  <span className="text-text-muted text-xs">rodadas</span>
                </div>
              </CardContent>
            </Card>

            {/* Average Latency */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Latência Média
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Tempo médio de resposta
                  </CardDescription>
                </div>
                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl border border-amber-500/10">
                  <Zap className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">{execMetrics.averageLatencyMs}</span>
                  <span className="text-text-muted text-xs">ms</span>
                </div>
              </CardContent>
            </Card>

            {/* Most Used Tool */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Ferramenta Mais Usada
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Maior taxa de engajamento
                  </CardDescription>
                </div>
                <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl border border-indigo-500/10">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left flex items-center justify-between">
                <span className="text-text-primary text-xs font-extrabold bg-neutral-light/50 px-2 py-0.5 rounded-sm truncate max-w-[120px]">
                  {execMetrics.mostUsedToolId.replace('_tool', '').toUpperCase()}
                </span>
                <Link href="/tools" passHref legacyBehavior>
                  <a className="text-primary hover:text-primary-hover text-[11px] font-bold inline-flex items-center gap-0.5 shrink-0">
                    Ver todas
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
                    Agentes Ativos Atualizados Recentemente ({workspaceIsolatedAgents.length} isolados)
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
                      <p className="text-text-primary text-sm font-medium">Nenhum agente ativo neste Workspace</p>
                      <p className="text-text-muted text-xs mt-1">Experimente alternar de workspace na barra superior.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Timeline Widget */}
              <div className="space-y-3.5 pt-2 text-left">
                <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2 px-1">
                  <Activity className="h-4.5 w-4.5 text-primary animate-pulse" />
                  Linha de Tempo de Execuções Recentes (Ferramentas)
                </h3>
                <ExecutionTimeline steps={dashboardTimeline} />
              </div>
            </div>

            {/* Right Column: Recent Memories list & Quick Actions */}
            <div className="space-y-6">
              {/* Sprint 7 Workflow activity feed */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-success animate-pulse" />
                    Atividade Recente de Workflows
                  </h3>
                </div>

                <Card className="p-4 space-y-4">
                  {recentWfLogs.map((log) => (
                    <div key={log.id} className="text-left space-y-1 pb-3 last:pb-0 border-b last:border-0 border-border/30">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="bg-success/10 text-success px-1.5 py-0.2 rounded-xs uppercase">
                          {log.status}
                        </span>
                        <span className="text-text-muted">{formatDate(log.timestamp).split(' ')[0]}</span>
                      </div>
                      <p className="text-text-primary text-xs font-semibold leading-normal">
                        Execução {log.executionId} ({log.durationMs}ms)
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Nós visitados: {log.executionPath.join(' → ')}
                      </p>
                    </div>
                  ))}
                  {recentWfLogs.length === 0 && (
                    <p className="text-text-muted text-xs text-center py-4">
                      Nenhum log de fluxo registrado.
                    </p>
                  )}
                </Card>
              </div>

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

                <Card className="p-4 space-y-3.5 text-left">
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

                  <Link href="/workflows" passHref legacyBehavior>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-success" />
                        Visual Workflow Canvas
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </Button>
                  </Link>

                  <Link href="/tools" passHref legacyBehavior>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full flex items-center justify-between border-border"
                    >
                      <span className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        Gerenciador de Ferramentas
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
    </RouteProtection>
  );
}
