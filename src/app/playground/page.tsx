'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Sliders,
  Zap,
  Cpu,
  Database,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAgents } from '@/context/AgentContext';
import { ChatMessage } from '../../lib/ai/types';
import { useToast } from '../../components/ui/Toast';
import { AgentExecutor } from '../../lib/tools/executor/AgentExecutor';
import { ToolRegistry } from '../../lib/tools/registry/ToolRegistry';
import { ExecutionTimeline } from '../../components/tools/TimelineComponents';
import { Card } from '../../components/ui/Card';
import { ToolStatus, ToolResult } from '../../lib/tools/types';

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

export default function UpgradedPlaygroundPage() {
  const { agents } = useAgents();
  const { toast } = useToast();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [playPrompt, setPlayPrompt] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);

  // Last Execution Metadata and Steps
  const [lastCitations, setLastCitations] = useState<string[]>([]);
  const [lastUsage, setLastUsage] = useState<{
    totalTokens: number;
    latencyMs: number;
  } | null>(null);
  const [lastTimelineSteps, setLastTimelineSteps] = useState<TimelineStepData[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default active agent select on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const active = agents.filter((a) => a.status === 'active');
      if (active.length > 0) {
        setSelectedAgentId(active[0].id);
      } else if (agents.length > 0) {
        setSelectedAgentId(agents[0].id);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [agents]);

  // Default all tool ids as selected
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const reg = ToolRegistry.getInstance();
        setSelectedToolIds(reg.list().map((t) => t.id));
      } catch {
        // safe fallback
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!playPrompt.trim() || isGenerating) return;

    const agent = agents.find((a) => a.id === selectedAgentId);
    if (!agent) {
      toast('Nenhum Agente Selecionado', 'Por favor, selecione ou crie um agente para interagir.', 'danger');
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: playPrompt.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const originalPrompt = playPrompt;
    setPlayPrompt('');
    setIsGenerating(true);

    try {
      const executor = AgentExecutor.getInstance();

      // Trigger multi-layer orchestration simulation
      const result = await executor.execute(agent, originalPrompt, {
        agentId: agent.id,
        variables: {},
        memoryEnabled,
        ragEnabled,
      });

      // Filter timeline steps to show only those matching selectedToolIds
      const registry = ToolRegistry.getInstance();
      const mappedSteps: TimelineStepData[] = result.stepsExecuted
        .filter((step) => selectedToolIds.includes(step.step.toolId))
        .map((step) => {
          const toolMeta = registry.find(step.step.toolId);
          return {
            toolId: step.step.toolId,
            toolName: toolMeta?.name || step.step.toolId,
            iconName: toolMeta?.icon || 'Terminal',
            reason: step.step.reason,
            durationMs: step.result.metrics?.durationMs || 10,
            status: step.result.success ? ('success' as ToolStatus) : ('failed' as ToolStatus),
            input: step.step.input,
            output: step.result,
          };
        });

      setLastTimelineSteps(mappedSteps);
      setLastCitations(result.citations);
      setLastUsage(result.usage);

      // Append Response message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: result.agentResponse,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast('Execução Falhou', errMsg, 'danger');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: `⚠️ [Falha no Executor]: O motor de ferramentas e planejamento heuristics falhou. Detalhes: ${errMsg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setLastTimelineSteps([]);
    setLastUsage(null);
    setLastCitations([]);
    toast('Sessão Reiniciada', 'O feed de interações do Playground foi limpo.', 'info');
  };

  const handleToolToggle = (id: string) => {
    setSelectedToolIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const allTools = ToolRegistry.getInstance().list();

  return (
    <WorkspaceLayout
      activePath="playground"
      title="Playground Multitool de Agentes"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Playground' }]}
    >
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 h-[calc(100vh-10rem)] text-left">
        {/* Left Side: Agent Chat Feed */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-w-0 shadow-xs">
          {/* Topbar of Feed */}
          <div className="border-b border-border p-4 bg-neutral-light/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              <div className="text-left">
                <span className="text-text-primary text-sm font-bold block">
                  Console de Simulação Heurística
                </span>
                <span className="text-text-muted text-[10px] block">
                  Planejamento e resolução automática de tarefas com acesso a ferramentas
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={handleClearHistory}
              disabled={messages.length === 0}
            >
              Limpar Conversa
            </Button>
          </div>

          {/* Messages view list */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.length > 0 ? (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Role circle avatar */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs select-none ${
                        isUser
                          ? 'bg-primary text-white'
                          : 'bg-neutral-light border border-border text-text-primary'
                      }`}
                    >
                      {isUser ? 'U' : 'AI'}
                    </div>

                    <div className="space-y-1 max-w-[85%] text-left">
                      <div
                        className={`rounded-2xl p-4 text-sm leading-relaxed border ${
                          isUser
                            ? 'bg-primary/5 text-text-primary border-primary/20 rounded-tr-none'
                            : 'bg-neutral-light/30 text-text-primary border-border/50 rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>

                      <div
                        className={`flex items-center gap-2 text-[9px] text-text-muted select-none px-1 ${
                          isUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {!isUser && selectedAgent && (
                          <>
                            <span>&bull;</span>
                            <span className="font-semibold text-primary">{selectedAgent.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none my-12">
                <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                  <Cpu className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="text-text-primary text-base font-bold">Inicie a Orquestração Multitool</h3>
                <p className="text-text-secondary text-xs mt-1 max-w-md leading-relaxed">
                  Digite uma solicitação que requeira ferramentas. Ex: <i>&quot;Calcular 250 * 12 e buscar no RAG o manual de conformidade&quot;</i>. O executor planejará os passos e resolverá tudo!
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="flex gap-3 mr-auto max-w-3xl">
                <div className="h-8 w-8 rounded-full bg-neutral-light border border-border flex items-center justify-center text-xs font-bold text-text-primary select-none">
                  AI
                </div>
                <div className="rounded-2xl p-4 bg-neutral-light/30 border border-border/50 rounded-tl-none text-sm text-text-muted flex items-center gap-2 select-none text-left">
                  <LoadingSpinner size="xs" />
                  <div className="space-y-1">
                    <p className="font-semibold text-xs text-text-primary">Planejando execuções...</p>
                    <p className="text-[10px] text-text-muted leading-tight">Buscando contextos e resolvendo tarefas heuristicamente</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form write panel */}
          <div className="p-4 border-t border-border bg-neutral-light/10 shrink-0">
            <form onSubmit={handleSendPrompt} className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  placeholder={
                    selectedAgent
                      ? `Escreva uma instrução para o agente ${selectedAgent.name}...`
                      : 'Escolha um agente no painel ao lado...'
                  }
                  value={playPrompt}
                  onChange={(e) => setPlayPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  rows={1}
                  className="py-3 px-4 resize-none max-h-32 bg-card rounded-xl"
                  disabled={isGenerating || !selectedAgentId}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="rounded-xl h-[44px] shrink-0"
                disabled={!playPrompt.trim() || isGenerating || !selectedAgentId}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Executar
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side: Parameters & Timeline Visualization split column */}
        <div className="w-full xl:w-96 flex flex-col gap-6 select-none shrink-0 overflow-y-auto h-auto xl:h-full">
          {/* Step Config Panel */}
          <Card className="p-5 space-y-5 text-left border-border">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Sliders className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-text-primary text-sm font-bold">Motor de Orquestração</h3>
            </div>

            <div className="space-y-4">
              {/* Agent Selector */}
              <Select
                label="Agente de IA Ativo"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.specialty})
                  </option>
                ))}
              </Select>

              {/* Memory and RAG toggles */}
              <div className="space-y-2.5 pt-1">
                <span className="text-text-primary text-xs font-semibold block">Camadas Cognitivas</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={memoryEnabled}
                      onChange={(e) => setMemoryEnabled(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <Database className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Habilitar Memory Store (Long-term)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ragEnabled}
                      onChange={(e) => setRagEnabled(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Habilitar RAG Indexer (Docs)</span>
                  </label>
                </div>
              </div>

              {/* Tool selector checklist */}
              <div className="space-y-2">
                <span className="text-text-primary text-xs font-semibold block">Inclusão de Ferramentas</span>
                <div className="border border-border/60 bg-neutral-light/10 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                  {allTools.map((tool) => (
                    <label key={tool.id} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedToolIds.includes(tool.id)}
                        onChange={() => handleToolToggle(tool.id)}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{tool.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Last Execution Statistics Metrics */}
          {lastUsage && (
            <Card className="p-4 bg-neutral-light/30 border-border/60 space-y-3.5 text-left animate-in slide-in-from-bottom-2 duration-300">
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent animate-pulse" />
                Métricas da Orquestração
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Duração de Execução</span>
                  <span className="font-extrabold text-text-primary">{lastUsage.latencyMs}ms</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Tokens Heurísticos</span>
                  <span className="font-semibold text-text-primary">{lastUsage.totalTokens} tkn</span>
                </div>
                {lastCitations.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase">Fontes/Citações RAG:</span>
                    <ul className="text-[10px] text-text-secondary list-disc pl-4 space-y-0.5 text-left">
                      {lastCitations.map((cit, idx) => (
                        <li key={idx}>{cit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Execution Timeline visualizer */}
          <div className="flex-1 flex flex-col space-y-3 pb-6">
            <h4 className="text-text-primary text-xs font-bold flex items-center gap-1.5 text-left px-1">
              <ArrowRight className="h-4 w-4 text-primary" />
              Linha de Tempo de Execuções
            </h4>
            <div className="flex-1 overflow-y-auto max-h-[450px]">
              <ExecutionTimeline steps={lastTimelineSteps} />
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
