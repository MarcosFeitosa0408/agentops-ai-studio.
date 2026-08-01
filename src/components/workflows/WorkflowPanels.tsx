'use client';

import React from 'react';
import { WorkflowNode, WorkflowNodeExecution } from '@/lib/workflows/types';
import {
  Play,
  Cpu,
  Wrench,
  HelpCircle,
  Clock,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// 1. WorkflowEmptyState
export const WorkflowEmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  return (
    <div className="border border-dashed border-border/80 rounded-2xl p-16 text-center select-none bg-card">
      <div className="bg-primary/10 text-primary p-4 rounded-full w-fit mx-auto mb-4 border border-primary/10">
        <Play className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-text-primary text-base font-bold">Nenhum Workflow Automatizado</h3>
      <p className="text-text-muted text-xs mt-1 max-w-sm mx-auto leading-relaxed">
        Monte diagramas estruturados e orquestre múltiplos agentes e conectores de recursos para rodar em sequências inteligentes.
      </p>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={onCreate}
        className="mt-5 rounded-xl h-9"
      >
        Novo Workflow
      </Button>
    </div>
  );
};

// 2. WorkflowToolbar
export const WorkflowToolbar: React.FC<{
  onRun: () => void;
  isRunning: boolean;
  onSave?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}> = ({ onRun, isRunning, onSave, onDuplicate, onDelete }) => {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 select-none">
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="xs"
          onClick={onRun}
          disabled={isRunning}
          leftIcon={<Play className="h-3.5 w-3.5" />}
          className="rounded-lg bg-success hover:bg-success-hover font-semibold px-3 text-[11px] h-8"
        >
          {isRunning ? 'Executando...' : 'Executar Workflow'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {onSave && (
          <Button variant="outline" size="xs" onClick={onSave} className="rounded-lg h-8 text-[11px] font-bold">
            Salvar
          </Button>
        )}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="p-2 border border-border/80 rounded-lg hover:bg-neutral-light/50 text-text-secondary cursor-pointer"
            title="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 border border-danger/10 bg-danger/5 hover:bg-danger/10 rounded-lg text-danger cursor-pointer"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// 3. WorkflowSidebar (Toolbox helper)
export const WorkflowSidebar: React.FC<{
  onAddNode: (type: WorkflowNode['type']) => void;
}> = ({ onAddNode }) => {
  const tools: { type: WorkflowNode['type']; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { type: 'agent', label: 'Especialista de IA', icon: Cpu, color: 'text-accent bg-accent/5' },
    { type: 'tool', label: 'Conector de Recurso', icon: Wrench, color: 'text-primary bg-primary/5' },
    { type: 'condition', label: 'Branch Condicional', icon: HelpCircle, color: 'text-amber-500 bg-amber-500/5' },
    { type: 'delay', label: 'Temporizador Delay', icon: Clock, color: 'text-indigo-500 bg-indigo-500/5' },
  ];

  return (
    <Card className="p-4 space-y-4 border-border text-left select-none">
      <div className="border-b border-border/40 pb-2">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Toolbox de Elementos</span>
      </div>

      <div className="space-y-2">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.type}
              onClick={() => onAddNode(t.type)}
              className="flex w-full items-center gap-3 border border-border/60 hover:border-primary/20 rounded-xl p-2.5 hover:bg-neutral-light/30 transition-all text-xs text-text-secondary hover:text-text-primary text-left cursor-pointer"
            >
              <span className={`p-1.5 rounded-lg border border-border/30 ${t.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-bold leading-none block">{t.label}</span>
                <span className="text-[9px] text-text-muted mt-0.5 leading-none block truncate">Adicionar elemento</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// 4. WorkflowInspector
export const WorkflowInspector: React.FC<{
  node: WorkflowNode | null;
  onUpdateNodeConfig: (id: string, config: Record<string, unknown>) => void;
  onDeleteNode: (id: string) => void;
}> = ({ node, onUpdateNodeConfig, onDeleteNode }) => {
  if (!node) {
    return (
      <Card className="p-5 text-center text-text-muted text-xs select-none border-border py-12 flex flex-col justify-center items-center">
        <Info className="h-6 w-6 text-text-muted mb-2" />
        <span>Selecione um elemento do canvas para inspecionar parâmetros</span>
      </Card>
    );
  }

  return (
    <Card className="p-5 text-left border-border select-none space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div>
          <span className="text-[10px] font-bold text-text-muted uppercase">Parâmetros do Elemento</span>
          <h4 className="text-text-primary text-xs font-bold leading-tight mt-0.5">{node.name}</h4>
        </div>
        <button
          onClick={() => onDeleteNode(node.id)}
          className="p-1.5 border border-danger/10 bg-danger/5 rounded-lg hover:bg-danger/10 text-danger cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {node.type === 'agent' && (
          <div className="space-y-2">
            <label className="text-text-primary font-semibold block">Selecione o Agente</label>
            <select
              value={(node.config.agentId as string) || 'agent-1'}
              onChange={(e) => onUpdateNodeConfig(node.id, { ...node.config, agentId: e.target.value })}
              className="border-border bg-neutral-light/20 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
            >
              <option value="agent-1">Analista de Dados</option>
              <option value="agent-2">Especialista SQL</option>
              <option value="agent-3">Analista Financeiro</option>
              <option value="agent-4">Especialista Power BI</option>
            </select>
          </div>
        )}

        {node.type === 'tool' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-text-primary font-semibold block">Selecione a Ferramenta</label>
              <select
                value={(node.config.toolId as string) || 'calculator_tool'}
                onChange={(e) => onUpdateNodeConfig(node.id, { ...node.config, toolId: e.target.value })}
                className="border-border bg-neutral-light/20 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
              >
                <option value="calculator_tool">High Precision Calculator</option>
                <option value="python_tool">Python Sandbox Executor</option>
                <option value="sql_tool">SQL Query Analyzer</option>
                <option value="rest_api_tool">REST API Dispatcher</option>
                <option value="memory_tool">Cognitive Memory Retriever</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-text-primary font-semibold block">Parâmetros (JSON)</label>
              <textarea
                value={JSON.stringify(node.config.toolInput || { expression: '150 * 5' }, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value) as Record<string, unknown>;
                    onUpdateNodeConfig(node.id, { ...node.config, toolInput: parsed });
                  } catch {
                    // skip syntax errors
                  }
                }}
                rows={4}
                className="font-mono text-[10px] leading-relaxed border-border bg-neutral-light/20 w-full rounded-xl border p-2.5 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {node.type === 'condition' && node.config.condition && (
          <div className="space-y-3">
            <span className="text-text-primary font-semibold block">Condição de Branch</span>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px] block">Nome da Variável</label>
              <input
                type="text"
                value={node.config.condition.variableName}
                onChange={(e) => onUpdateNodeConfig(node.id, {
                  ...node.config,
                  condition: { ...node.config.condition, variableName: e.target.value }
                })}
                className="border-border bg-neutral-light/20 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px] block">Operador</label>
              <select
                value={node.config.condition.operator}
                onChange={(e) => onUpdateNodeConfig(node.id, {
                  ...node.config,
                  condition: { ...node.config.condition, operator: e.target.value }
                })}
                className="border-border bg-neutral-light/20 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
              >
                <option value="equals">Igual</option>
                <option value="not_equals">Diferente</option>
                <option value="contains">Contém</option>
                <option value="greater_than">Maior que</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-text-muted text-[10px] block">Valor Alvo</label>
              <input
                type="text"
                value={String(node.config.condition.value)}
                onChange={(e) => onUpdateNodeConfig(node.id, {
                  ...node.config,
                  condition: { ...node.config.condition, value: e.target.value }
                })}
                className="border-border bg-neutral-light/20 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {node.type === 'delay' && (
          <div className="space-y-2">
            <label className="text-text-primary font-semibold block">Duração do Delay (ms)</label>
            <input
              type="number"
              step="100"
              value={(node.config.delayMs as number) || 200}
              onChange={(e) => onUpdateNodeConfig(node.id, { ...node.config, delayMs: parseInt(e.target.value) || 200 })}
              className="border-border bg-neutral-light/20 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

// 5. WorkflowExecutionTimeline
export const WorkflowExecutionTimeline: React.FC<{
  steps: WorkflowNodeExecution[];
}> = ({ steps }) => {
  if (steps.length === 0) return null;

  return (
    <Card className="p-4.5 space-y-4 border-border text-left select-none">
      <div className="border-b border-border/40 pb-2">
        <span className="text-[10px] font-bold text-text-muted uppercase">Trilha de Rodada Recente</span>
      </div>

      <div className="space-y-3 relative border-l border-border/60 pl-4 max-h-56 overflow-y-auto">
        {steps.map((s, idx) => {
          const isDone = s.status === 'completed';
          const isFailed = s.status === 'failed';
          const hasOutput = s.output !== undefined && s.output !== null;
          const outputStr = typeof s.output === 'object' ? JSON.stringify(s.output) : String(s.output || '');

          return (
            <div key={idx} className="relative">
              {/* Timeline Connector Dot */}
              <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border ${
                isDone
                  ? 'bg-success border-success'
                  : isFailed
                    ? 'bg-danger border-danger'
                    : 'bg-primary border-primary animate-pulse'
              }`} />

              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-primary">{s.nodeName}</span>
                  <span className="text-[9px] text-text-muted font-mono">{s.durationMs ? `${s.durationMs}ms` : 'running'}</span>
                </div>
                {s.error && <p className="text-[10px] text-danger font-medium leading-none">{s.error}</p>}
                {isDone && hasOutput && (
                  <p className="text-[10px] text-text-muted line-clamp-1 italic">
                    &quot;{outputStr}&quot;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// 6. WorkflowMiniMap
export const WorkflowMiniMap: React.FC<{
  nodes: WorkflowNode[];
  activeNodeId?: string | null;
}> = ({ nodes, activeNodeId }) => {
  return (
    <Card className="p-3 bg-neutral-light/10 border-border/60 space-y-2 text-left relative overflow-hidden select-none">
      <span className="text-[9px] font-bold text-text-muted uppercase block">Minimap de Estados</span>
      <div className="h-16 relative bg-neutral-light/30 border border-border/40 rounded-lg">
        {nodes.map((n) => (
          <div
            key={n.id}
            style={{
              left: `${(n.position.x / 1000) * 100}%`,
              top: `${(n.position.y / 600) * 100}%`,
            }}
            className={`absolute h-2 w-3.5 rounded-xs ${
              activeNodeId === n.id ? 'bg-primary animate-pulse scale-150' : 'bg-text-muted/40'
            }`}
          />
        ))}
      </div>
    </Card>
  );
};
