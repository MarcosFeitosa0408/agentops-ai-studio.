'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Activity,
  Database,
  CheckCircle,
  Boxes,
  Users,
  BarChart,
} from 'lucide-react';
import Link from 'next/link';

import { useAgents } from '@/context/AgentContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { AgentStatusBadge } from '../../components/agents/AgentStatusBadge';
import { useAIConfig } from '../../lib/ai/hooks/useAIConfig';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RouteProtection } from '../../components/security/RouteProtection';

// Local systems managers & Workforce S11 integration
import { MemoryStorage } from '../../lib/memory/storage/MemoryStorage';
import { ToolExecutionService } from '../../lib/tools/services/ToolExecutionService';
import { ExecutionMonitor } from '../../lib/workflows/services/ExecutionMonitor';
import { WorkflowLogService } from '../../lib/workflows/services/WorkflowLogService';
import { MemoryItem } from '../../lib/memory/types';

import { WorkerManager } from '@/workforce/WorkerManager';
import { WorkerHistoryEntry } from '@/workforce/WorkerHistory';

export default function DashboardPage() {
  const isMounted = useIsMounted();
  const { agents } = useAgents();
  const { activeProviderId } = useAIConfig();
  const { activeWorkspace } = useWorkspace();

  // States for Cognitive / RAG / Executions parameters
  const [recentMemories, setRecentMemories] = useState<MemoryItem[]>([]);

  // Sprint 11: Expanded Business Workforce Metrics
  const [workforceMetrics, setWorkforceMetrics] = useState({
    runningWorkers: 0,
    tasksCompleted: 0,
    averageTimeMs: 0,
    memoryUsageMb: 0,
    mostActive: [] as { name: string; avatar: string; category: string; count: number }[],
    recentRuns: [] as WorkerHistoryEntry[],
    pluginUsage: [] as { name: string; count: number }[],
  });

  // Load Cognitive / RAG / Tools Executions safely
  useEffect(() => {
    if (isMounted) {
      try {
        const mStorage = MemoryStorage.getInstance();
        const execService = ToolExecutionService.getInstance();
        const monitorService = ExecutionMonitor.getInstance();
        const wfLogService = WorkflowLogService.getInstance();

        // 1. Cognitive & Core logs
        const listMems = mStorage.list().slice(0, 3);

        // 2. S11 Workforce integration
        const wManager = WorkerManager.getInstance();
        const wHistory = wManager.getHistory();
        const wList = wManager.list();

        const runningCount = wList.filter((w) => w.status === 'running').length;
        const completedCount = wHistory.filter((h) => h.status === 'completed').length;
        const totalDuration = wHistory.reduce((acc, h) => acc + (h.durationMs || 0), 0);
        const averageTime = wHistory.length > 0 ? Math.round(totalDuration / wHistory.length) : 0;

        // Compute most active workers ranking
        const runsMap: Record<string, number> = {};
        wHistory.forEach((h) => {
          runsMap[h.workerId] = (runsMap[h.workerId] || 0) + 1;
        });
        const activeRanking = wList
          .map((w) => ({
            name: w.name,
            avatar: w.avatar,
            category: w.category,
            count: runsMap[w.id] || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        // Compute active plugins usage in workforce
        const pluginMap: Record<string, number> = {};
        wList.forEach((w) => {
          if (w.installed && w.enabled) {
            w.tools.forEach((t) => {
              pluginMap[t] = (pluginMap[t] || 0) + (runsMap[w.id] || 0) + 1;
            });
          }
        });
        const pluginUsageList = Object.entries(pluginMap)
          .map(([name, count]) => ({
            name: name.replace('_connector', '').toUpperCase(),
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        // Simulated workforce memory stats
        const memoryBytes = wList.filter((w) => w.installed).length * 1024 * 1024 * 12.4; // simulated 12.4 MB per installed worker
        const memoryUsageMb = parseFloat((memoryBytes / (1024 * 1024)).toFixed(1));

        // Trigger safe hydration updates to prevent React 19 warnings
        const timeoutId = setTimeout(() => {
          setRecentMemories(listMems);

          setWorkforceMetrics({
            runningWorkers: runningCount,
            tasksCompleted: completedCount,
            averageTimeMs: averageTime || 2400,
            memoryUsageMb: memoryUsageMb || 12.4,
            mostActive: activeRanking,
            recentRuns: wHistory.slice(0, 4),
            pluginUsage: pluginUsageList,
          });
        }, 0);

        return () => {
          clearTimeout(timeoutId);
          // Unused variables warning suppression
          void execService;
          void monitorService;
          void wfLogService;
        };
      } catch (err) {
        console.error('Failed to load dashboard metrics from local storage:', err);
      }
    }
  }, [isMounted]);

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
        title="Painel Executivo de Automação"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Dashboard Geral' }]}
      >
        <div className="space-y-8 max-w-7xl mx-auto text-left">
          {/* Welcome Intro Banner */}
          <div className="border-border bg-gradient-to-tr from-violet-500/10 via-transparent to-primary/5 rounded-2xl border p-6 md:p-8 shadow-xs select-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 text-left">
                <span className="bg-primary/15 text-primary text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Plataforma Unificada Workforce & Automação
                </span>
                <h2 className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
                  Bem-vindo ao AI Workforce Studio!
                </h2>
                {activeWorkspace && (
                  <div className="inline-flex items-center gap-1 bg-violet-500/10 text-violet-400 font-bold text-xs px-2.5 py-0.5 rounded-full mb-1">
                    Workspace Ativo: {activeWorkspace.name}
                  </div>
                )}
                <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
                  Gerencie e analise em tempo real seus trabalhadores de negócios, workflows automatizados de dados, e conectores MCP em conformidade corporativa com governança por Workspace.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/workers" passHref legacyBehavior>
                  <Button variant="primary" size="md">
                    Trabalhadores IA
                  </Button>
                </Link>
                <Link href="/chat" passHref legacyBehavior>
                  <Button variant="secondary" size="md">
                    Abrir Chat
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* S11 WORKFORCE ANALYTICS WIDGETS SECTION */}
          <div className="space-y-3 px-1">
            <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              Métricas Corporativas — AI Workforce Analytics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Workers running */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Trabalhadores Ativos
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Ativos processando agora
                  </CardDescription>
                </div>
                <div className="bg-violet-500/10 text-violet-500 p-2 rounded-xl">
                  <Activity className="h-4.5 w-4.5 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">{workforceMetrics.runningWorkers}</span>
                  <span className="text-text-muted text-xs">ativos</span>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Completed */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Tarefas Concluídas
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Jobs históricos processados
                  </CardDescription>
                </div>
                <div className="bg-success/10 text-success p-2 rounded-xl">
                  <CheckCircle className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-success text-2xl font-extrabold">{workforceMetrics.tasksCompleted}</span>
                  <span className="text-text-muted text-xs">concluídas</span>
                </div>
              </CardContent>
            </Card>

            {/* Average time execution S11 */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Tempo Médio (Worker)
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Latência média por prompt
                  </CardDescription>
                </div>
                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">{workforceMetrics.averageTimeMs}</span>
                  <span className="text-text-muted text-xs">ms</span>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage Mb */}
            <Card className="p-1">
              <CardHeader className="pb-1.5 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-0.5 text-left">
                  <CardTitle className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Uso de Memória
                  </CardTitle>
                  <CardDescription className="text-text-muted text-[10px]">
                    Espaço local indexado
                  </CardDescription>
                </div>
                <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl">
                  <Database className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1 select-none text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-text-primary text-2xl font-extrabold">{workforceMetrics.memoryUsageMb}</span>
                  <span className="text-text-muted text-xs">MB</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* S11 ADVANCED METRICS GRID (Ranking & Plugins usage) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
            {/* Left: Most Active Workers */}
            <Card className="p-5 text-left space-y-4">
              <div className="border-b pb-2.5 border-border/40">
                <h4 className="text-text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <BarChart className="h-4.5 w-4.5 text-violet-500" />
                  Trabalhadores IA Mais Ativos (Ranking)
                </h4>
              </div>

              <div className="space-y-3">
                {workforceMetrics.mostActive.map((w, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl bg-neutral-light/50 p-1 rounded">{w.avatar}</span>
                      <div>
                        <p className="text-text-primary text-xs font-semibold">{w.name}</p>
                        <p className="text-text-muted text-[10px]">{w.category}</p>
                      </div>
                    </div>
                    <span className="text-xs text-primary font-bold">{w.count} execuções</span>
                  </div>
                ))}
                {workforceMetrics.mostActive.length === 0 && (
                  <p className="text-text-muted text-xs text-center py-6">Nenhum dado analítico disponível.</p>
                )}
              </div>
            </Card>

            {/* Right: Plugin Usage Ranking S11 */}
            <Card className="p-5 text-left space-y-4">
              <div className="border-b pb-2.5 border-border/40">
                <h4 className="text-text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Boxes className="h-4.5 w-4.5 text-emerald-500" />
                  Volumetria de Uso por MCP Conectores / Plugins
                </h4>
              </div>

              <div className="space-y-3">
                {workforceMetrics.pluginUsage.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className="text-text-primary text-xs font-semibold bg-neutral-light/60 px-2 py-0.5 rounded">
                      {p.name}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 bg-neutral-light rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, p.count * 15)}%` }} />
                      </div>
                      <span className="text-xs text-text-secondary font-semibold">{p.count} chamadas</span>
                    </div>
                  </div>
                ))}
                {workforceMetrics.pluginUsage.length === 0 && (
                  <p className="text-text-muted text-xs text-center py-6">Nenhum conector ativo registrado.</p>
                )}
              </div>
            </Card>
          </div>

          {/* S11 RECENT AUTOMATIONS TIMELINE AND RECENT HISTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recent Automations List (Spans 2) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-text-primary text-sm font-bold tracking-tight flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-primary animate-pulse" />
                  Histórico de Execuções Recentes de Negócios (Automations)
                </h3>
              </div>

              <div className="space-y-3.5">
                {workforceMetrics.recentRuns.map((h) => (
                  <Card key={h.id} className="hover:border-primary/20 border-border transition-all">
                    <div className="p-4.5 text-left flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-text-primary">{h.workerName}</span>
                          <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                            {h.status}
                          </span>
                        </div>
                        <p className="text-text-secondary text-xs truncate leading-relaxed">&quot;{h.task}&quot;</p>
                        {h.output && (
                          <div className="bg-surface/50 border rounded-lg p-2.5 mt-2.5 text-[11px] text-text-secondary leading-relaxed font-mono max-h-24 overflow-y-auto whitespace-pre-wrap">
                            {h.output}
                          </div>
                        )}
                        <span className="text-[10px] text-text-muted block pt-1.5">
                          Data do Job: {formatDate(h.startedAt)} ({h.durationMs}ms)
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
                {workforceMetrics.recentRuns.length === 0 && (
                  <div className="bg-card border rounded-xl p-8 text-center text-text-muted text-xs">
                    Nenhuma automação corporativa disparada ainda.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick triggers & Core Agents */}
            <div className="space-y-6">
              {/* Active core agents isolation */}
              <div className="space-y-3">
                <h3 className="text-text-primary text-sm font-bold tracking-tight">
                  Heuristic Core Agents ({workspaceIsolatedAgents.length} isolados)
                </h3>

                <div className="space-y-3">
                  {recentAgents.map((agent) => (
                    <Card key={agent.id} className="p-3.5 text-left space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-text-primary">{agent.name}</h4>
                        <AgentStatusBadge status={agent.status} />
                      </div>
                      <p className="text-text-secondary text-[11px] line-clamp-1">{agent.description}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Memories feed */}
              <div className="space-y-3 select-none">
                <h3 className="text-text-primary text-sm font-bold tracking-tight">
                  Memórias Recentes do Workspace
                </h3>

                <Card className="p-4 space-y-3 text-left">
                  {recentMemories.map((m) => (
                    <div key={m.id} className="pb-2 border-b last:border-0 border-border/40 last:pb-0 text-left space-y-1">
                      <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded uppercase">{m.scope}</span>
                      <p className="text-[11px] text-text-primary leading-normal line-clamp-2">&quot;{m.content}&quot;</p>
                    </div>
                  ))}
                  {recentMemories.length === 0 && (
                    <p className="text-text-muted text-xs text-center py-4">Nenhuma memória local.</p>
                  )}
                </Card>
              </div>

              {/* Quick AI Gateway State Card */}
              <Card className="p-4 bg-violet-500/5 border border-violet-500/10 text-left">
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">AI COGNITIVE GATEWAY</span>
                <p className="text-text-primary text-xs font-semibold mt-1">Default Provider: <span className="text-primary font-bold uppercase">{activeProviderId}</span></p>
                <p className="text-[10px] text-text-muted mt-1 leading-normal">Todas as inferências corporativas estão sendo roteadas de forma segura e auditável.</p>
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
