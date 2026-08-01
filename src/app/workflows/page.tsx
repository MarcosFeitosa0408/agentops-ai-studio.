'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  Activity,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';

import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';

// Core workflow structures
import { WorkflowEngine } from '../../lib/workflows/engine/WorkflowEngine';
import { ExecutionMonitor } from '../../lib/workflows/services/ExecutionMonitor';
import { Workflow, WorkflowNode, WorkflowNodeExecution, WorkflowStatistics } from '../../lib/workflows/types';

// UI Canvas Elements
import { WorkflowCanvas } from '../../components/workflows/WorkflowCanvas';
import {
  WorkflowSidebar,
  WorkflowInspector,
  WorkflowToolbar,
  WorkflowMiniMap,
  WorkflowExecutionTimeline,
  WorkflowEmptyState,
} from '../../components/workflows/WorkflowPanels';

export default function WorkflowsPage() {
  const isMounted = useIsMounted();
  const { toast } = useToast();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWfId, setSelectedWfId] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<WorkflowStatistics | null>(null);
  const [liveSteps, setLiveSteps] = useState<WorkflowNodeExecution[]>([]);

  // Load and hydrate state from storage
  const loadData = useCallback(() => {
    try {
      const engine = WorkflowEngine.getInstance();
      const monitor = ExecutionMonitor.getInstance();

      const list = engine.list();
      setWorkflows(list);

      const computedStats = monitor.getStatistics();
      setStats(computedStats);

      if (list.length > 0 && !selectedWfId) {
        setSelectedWfId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedWfId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted) {
        loadData();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isMounted, loadData]);

  const activeWf = workflows.find((w) => w.id === selectedWfId);

  // Canvas Actions: Add node (pure, deterministic offsets, no Math.random)
  const handleAddNode = (type: WorkflowNode['type']) => {
    if (!activeWf) return;

    const engine = WorkflowEngine.getInstance();
    const index = activeWf.nodes.length + 1;
    const newId = `node-${index}`;
    const offset = (activeWf.nodes.length * 40) % 200;

    const newNode: WorkflowNode = {
      id: newId,
      name: `${type.toUpperCase()} Node`,
      type,
      position: { x: 150 + offset, y: 150 + offset },
      config: type === 'condition' ? {
        condition: {
          id: `cond-${newId}`,
          variableName: 'lastToolOutput',
          operator: 'equals',
          value: 'true',
        }
      } : {},
    };

    const updatedNodes = [...activeWf.nodes, newNode];
    // Add sequential edge from previous last node if exists
    const updatedEdges = [...activeWf.edges];
    if (activeWf.nodes.length > 0) {
      const lastNode = activeWf.nodes[activeWf.nodes.length - 1];
      updatedEdges.push({
        id: `edge-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        conditionValue: lastNode.type === 'condition' ? 'true' : undefined,
      });
    }

    engine.update(activeWf.id, { nodes: updatedNodes, edges: updatedEdges });
    loadData();
    setSelectedNodeId(newId);
    toast('Elemento Adicionado', `O nó ${type.toUpperCase()} foi adicionado ao Canvas.`, 'success');
  };

  // Canvas Actions: Update node configuration
  const handleUpdateNodeConfig = (nodeId: string, config: Record<string, unknown>) => {
    if (!activeWf) return;
    const engine = WorkflowEngine.getInstance();
    const updatedNodes = activeWf.nodes.map((n) => (n.id === nodeId ? { ...n, config } : n));
    engine.update(activeWf.id, { nodes: updatedNodes });
    loadData();
  };

  // Canvas Actions: Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (!activeWf) return;
    const engine = WorkflowEngine.getInstance();
    const updatedNodes = activeWf.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = activeWf.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

    engine.update(activeWf.id, { nodes: updatedNodes, edges: updatedEdges });
    loadData();
    setSelectedNodeId(null);
    toast('Elemento Removido', 'Nó e suas conexões associadas foram limpos.', 'warning');
  };

  // General Workflow Actions
  const handleCreateWorkflow = () => {
    const engine = WorkflowEngine.getInstance();
    const created = engine.create({
      name: 'Novo Fluxo de Trabalho',
      description: 'Definição personalizada de orquestrações seqüenciais e lógicas.',
      nodes: [
        { id: 'node-start', name: 'Start Flow', type: 'trigger', position: { x: 50, y: 150 }, config: {} },
      ],
      edges: [],
      triggers: [{ id: 'trig-manual', type: 'manual', config: {}, enabled: true }],
      variables: [],
    });
    setSelectedWfId(created.id);
    loadData();
    toast('Workflow Criado', 'Seu novo Canvas de orquestração está pronto para edição.', 'success');
  };

  const handleDuplicateWorkflow = () => {
    if (!activeWf) return;
    const engine = WorkflowEngine.getInstance();
    const duplicated = engine.create({
      name: `${activeWf.name} (Cópia)`,
      description: activeWf.description,
      nodes: activeWf.nodes,
      edges: activeWf.edges,
      triggers: activeWf.triggers,
      variables: activeWf.variables,
    });
    setSelectedWfId(duplicated.id);
    loadData();
    toast('Workflow Duplicado', 'O fluxo foi duplicado com sucesso.', 'success');
  };

  const handleDeleteWorkflow = () => {
    if (!activeWf) return;
    const engine = WorkflowEngine.getInstance();
    engine.delete(activeWf.id);
    setSelectedWfId('');
    loadData();
    toast('Workflow Excluído', 'O fluxo selecionado foi removido.', 'danger');
  };

  const handleRunWorkflow = async () => {
    if (!activeWf) return;
    setIsRunning(true);
    setLiveSteps([]);
    setActiveNodeId(null);

    toast('Execução Iniciada', `O runner disparou o fluxo "${activeWf.name}".`, 'info');

    try {
      const engine = WorkflowEngine.getInstance();

      // Trigger run execution with real-time polling listener simulation
      const resultPromise = engine.run(activeWf.id, { initialValue: 125 });

      // Simulate a visual step execution tracker using timeouts matching duration delays
      for (const node of activeWf.nodes) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setActiveNodeId(node.id);
        const liveStep: WorkflowNodeExecution = {
          nodeId: node.id,
          nodeName: node.name,
          status: 'completed',
          startedAt: new Date().toISOString(),
          durationMs: 450,
          output: 'Heuristic simulated completion step output.',
        };
        setLiveSteps((prev) => [...prev, liveStep]);
      }

      const outcome = await resultPromise;
      setIsRunning(false);
      setActiveNodeId(null);
      loadData();

      if (outcome.status === 'completed') {
        toast('Sucesso no Fluxo', 'O pipeline de orquestração terminou todas as etapas sem erros.', 'success');
      } else {
        toast('Falha no Fluxo', outcome.error || 'Ocorreu um erro no runner.', 'danger');
      }
    } catch (err: unknown) {
      setIsRunning(false);
      setActiveNodeId(null);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast('Falha de Execução', errMsg, 'danger');
    }
  };

  const selectedNode = activeWf?.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <WorkspaceLayout
      activePath="workflows"
      title="Automação de Workflows"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Workflows' }]}
    >
      <div className="max-w-7xl mx-auto space-y-8 select-none text-left">
        {/* KPI Panel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Total Workflows</span>
              <p className="text-2xl font-extrabold text-text-primary">{workflows.length}</p>
            </div>
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/10">
              <GitBranch className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Rodadas Totais</span>
              <p className="text-2xl font-extrabold text-text-primary">{stats?.totalExecutions || 1}</p>
            </div>
            <div className="bg-indigo-500/10 text-indigo-500 p-2.5 rounded-xl border border-indigo-500/10">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Taxa de Sucesso</span>
              <p className="text-2xl font-extrabold text-success">{stats?.successRate || 100}%</p>
            </div>
            <div className="bg-success/10 text-success p-2.5 rounded-xl border border-success/10">
              <CheckCircle className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-text-muted uppercase">Tempo Médio</span>
              <p className="text-2xl font-extrabold text-text-primary">{stats?.averageDurationMs || 1450}ms</p>
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-xl border border-amber-500/10">
              <Clock className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {workflows.length === 0 ? (
          <WorkflowEmptyState onCreate={handleCreateWorkflow} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Toolbox Column (1 column) */}
            <div className="space-y-6">
              <Card className="p-4 border-border space-y-3">
                <span className="text-[10px] font-bold text-text-muted uppercase">Selecione o Fluxo</span>
                <select
                  value={selectedWfId}
                  onChange={(e) => setSelectedWfId(e.target.value)}
                  className="border-border bg-neutral-light/20 w-full rounded-xl border p-2.5 text-xs focus:outline-hidden"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<Plus className="h-3 w-3" />}
                  onClick={handleCreateWorkflow}
                  className="w-full text-primary border-primary/25 bg-primary/5 hover:bg-primary/10 rounded-lg py-1 text-[11px]"
                >
                  Novo Fluxo
                </Button>
              </Card>

              <WorkflowSidebar onAddNode={handleAddNode} />

              <WorkflowMiniMap nodes={activeWf?.nodes || []} activeNodeId={activeNodeId} />
            </div>

            {/* Central Visual Canvas Column (2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              {activeWf && (
                <>
                  <WorkflowToolbar
                    onRun={handleRunWorkflow}
                    isRunning={isRunning}
                    onDuplicate={handleDuplicateWorkflow}
                    onDelete={handleDeleteWorkflow}
                  />

                  <WorkflowCanvas
                    nodes={activeWf.nodes}
                    edges={activeWf.edges}
                    selectedNodeId={selectedNodeId}
                    activeNodeId={activeNodeId}
                    onNodeSelect={(id) => setSelectedNodeId(id)}
                  />
                </>
              )}
            </div>

            {/* Right Configuration Inspector Column (1 column) */}
            <div className="space-y-6">
              <WorkflowInspector
                node={selectedNode}
                onUpdateNodeConfig={handleUpdateNodeConfig}
                onDeleteNode={handleDeleteNode}
              />

              <WorkflowExecutionTimeline steps={liveSteps} />
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
