'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Download,
  Settings,
  Search,
  Cpu,
  Star,
  Activity,
} from 'lucide-react';

import { WorkerManager } from '@/workforce/WorkerManager';
import { AgentWorker } from '@/workforce/AgentWorker';
import { WorkerScheduler, ScheduledTask } from '@/workforce/WorkerScheduler';
import { executeWorkerTask } from '@/workforce/WorkerExecution';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { RouteProtection } from '@/components/security/RouteProtection';
import { WorkflowEngine } from '@/lib/workflows/engine/WorkflowEngine';

const AVAILABLE_AVATARS = ['📊', '💼', '📣', '💰', '📈', '💬', '📄', '🎙️', '🔍', '💻', '✍️', '🛢️', '🐍', '🔄', '🖥️', '🤖', '🚀', '🧠', '⚡', '🕵️‍♂️'];

const AVAILABLE_LLMS = [
  'Claude 3.5 Sonnet (Default)',
  'GPT-4o Advanced',
  'GPT-4o Mini',
  'Llama 3.1 8B (Local)',
  'Llama 3.1 70B',
  'Gemini 1.5 Pro',
];

const CATEGORIES = ['All', 'Analytics', 'Business', 'Marketing', 'Sales', 'Finance', 'Operations', 'Productivity', 'Development'];

const AVAILABLE_PLUGINS = [
  { id: 'slack_connector', name: 'Slack' },
  { id: 'github_connector', name: 'GitHub' },
  { id: 'gmail_connector', name: 'Gmail' },
  { id: 'notion_connector', name: 'Notion' },
  { id: 'google_drive_connector', name: 'Google Drive' },
  { id: 'postgresql_connector', name: 'PostgreSQL' },
  { id: 'mysql_connector', name: 'MySQL' },
  { id: 'filesystem_connector', name: 'Filesystem' },
];

const AVAILABLE_PERMISSIONS = [
  { id: 'workspace_read', name: 'Ler Workspace' },
  { id: 'workspace_write', name: 'Escrever Workspace' },
  { id: 'data_analyze', name: 'Executar Análise de Dados' },
  { id: 'mcp_execute', name: 'Chamar Conectores MCP' },
];

export default function WorkersPage() {
  const isMounted = useIsMounted();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'builder' | 'scheduler'>('marketplace');

  // Core Workforce lists
  const [workers, setWorkers] = useState<AgentWorker[]>([]);
  const [schedules, setSchedules] = useState<ScheduledTask[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'installed' | 'not_installed'>('all');

  // Builder form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [category, setCategory] = useState('Analytics');
  const [instructions, setInstructions] = useState('');
  const [llm, setLlm] = useState('Claude 3.5 Sonnet (Default)');
  const [temperature, setTemperature] = useState(0.2);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [defaultWorkflow, setDefaultWorkflow] = useState('');

  // Editing configuration state (Modal/Pane)
  const [editingWorker, setEditingWorker] = useState<AgentWorker | null>(null);
  const [editInstructions, setEditInstructions] = useState('');
  const [editLlm, setEditLlm] = useState('');
  const [editTemperature, setEditTemperature] = useState(0.2);
  const [editTools, setEditTools] = useState<string[]>([]);

  // Testing Execution state
  const [testingWorker, setTestingWorker] = useState<AgentWorker | null>(null);
  const [testTask, setTestTask] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [executionRunning, setExecutionRunning] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStep, setExecutionStep] = useState('');

  // Scheduler Form State
  const [scheduledWorkerId, setScheduledWorkerId] = useState('');
  const [scheduledTaskText, setScheduledTaskText] = useState('');
  const [scheduledCron, setScheduledCron] = useState('Diariamente às 09:00');

  // Load functions declared before useEffect
  const loadData = () => {
    const manager = WorkerManager.getInstance();
    setWorkers(manager.list());

    const scheduler = WorkerScheduler.getInstance();
    setSchedules(scheduler.list());

    const wEngine = WorkflowEngine.getInstance();
    setWorkflows(wEngine.list());
  };

  // Load state on mount
  useEffect(() => {
    if (isMounted) {
      setTimeout(() => {
        loadData();
      }, 0);
    }
  }, [isMounted]);

  // CRUD & Marketplace Actions
  const handleInstall = (id: string) => {
    const manager = WorkerManager.getInstance();
    manager.install(id);
    toast('Trabalhador Instalado', 'O assistente já está disponível para execuções no Chat.', 'success');
    loadData();
  };

  const handleUninstall = (id: string) => {
    const manager = WorkerManager.getInstance();
    manager.uninstall(id);
    toast('Trabalhador Removido', 'O assistente foi desinstalado e desativado.', 'warning');
    loadData();
  };

  const handleToggleEnable = (id: string) => {
    const manager = WorkerManager.getInstance();
    manager.toggleEnable(id);
    loadData();
  };

  const handleDuplicate = (id: string) => {
    const manager = WorkerManager.getInstance();
    const dup = manager.duplicate(id);
    toast('Cópia Criada', `Trabalhador duplicado com sucesso: "${dup.name}"`, 'success');
    loadData();
  };

  const handleDeleteCustom = (id: string) => {
    if (confirm('Tem certeza de que deseja remover este trabalhador customizado?')) {
      const manager = WorkerManager.getInstance();
      manager.deleteCustom(id);
      toast('Removido', 'O trabalhador customizado foi deletado do sistema.', 'warning');
      loadData();
    }
  };

  // Config Save
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    const manager = WorkerManager.getInstance();
    manager.updateConfig(editingWorker.id, {
      instructions: editInstructions,
      llm: editLlm,
      temperature: editTemperature,
      tools: editTools,
    });

    toast('Configuração Salva', `As diretrizes de "${editingWorker.name}" foram atualizadas.`, 'success');
    setEditingWorker(null);
    loadData();
  };

  // Open config panel
  const handleConfigureClick = (worker: AgentWorker) => {
    setEditingWorker(worker);
    setEditInstructions(worker.instructions);
    setEditLlm(worker.llm);
    setEditTemperature(worker.temperature);
    setEditTools(worker.tools);
  };

  // Create Custom Worker in Builder
  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Erro de Validação', 'O nome do trabalhador é obrigatório.', 'danger');
      return;
    }

    const manager = WorkerManager.getInstance();
    manager.createCustom({
      name: name.trim(),
      description: description.trim(),
      avatar,
      category,
      permissions: selectedPermissions,
      tools: selectedPlugins,
      workflow: defaultWorkflow || undefined,
      capabilities: [description.trim() || 'Processamento heurístico e analítico autônomo.'],
      promptTemplate: `${instructions}\nInstrução específica: {task}`,
      suggestedWorkflows: defaultWorkflow ? [defaultWorkflow] : [],
      tags: [category, llm.split(' ')[0]],
      instructions: instructions.trim() || 'Atue de forma profissional e eficiente.',
      llm,
      temperature,
      knowledgeBase: knowledgeBase ? knowledgeBase.split(',').map((k) => k.trim()) : [],
    });

    toast('Trabalhador Criado', `O trabalhador "${name}" foi adicionado com sucesso ao catálogo corporativo!`, 'success');

    // Reset builder form
    setName('');
    setDescription('');
    setInstructions('');
    setSelectedPlugins([]);
    setSelectedPermissions([]);
    setKnowledgeBase('');
    setDefaultWorkflow('');

    setActiveTab('marketplace');
    loadData();
  };

  // Toggle checklist values
  const togglePlugin = (id: string) => {
    setSelectedPlugins((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // Test Execution Trigger
  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testingWorker || !testTask.trim()) return;

    setExecutionRunning(true);
    setExecutionProgress(5);
    setExecutionStep('Inicializando o motor cognitivo do agente');
    setExecutionOutput('');

    try {
      const entry = await executeWorkerTask(testingWorker, testTask, {
        onProgress: (p, step) => {
          setExecutionProgress(p);
          setExecutionStep(step);
        },
      });

      // Save history entry
      WorkerManager.getInstance().addHistoryEntry(entry);

      setExecutionOutput(entry.output || entry.error || 'Erro desconhecido na execução.');
      toast('Tarefa Concluída', `O trabalhador ${testingWorker.name} processou o prompt com sucesso.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExecutionOutput(`### Falha Crítica na Execução\n\nErro retornado: ${msg}`);
      toast('Falha na Execução', 'Ocorreu um erro no processamento do agente.', 'danger');
    } finally {
      setExecutionRunning(false);
      loadData(); // Reload history logs
    }
  };

  // Scheduler creation
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledWorkerId || !scheduledTaskText.trim()) {
      toast('Erro de Validação', 'Por favor, selecione um trabalhador e forneça a descrição da tarefa.', 'danger');
      return;
    }

    const worker = workers.find((w) => w.id === scheduledWorkerId);
    if (!worker) return;

    const scheduler = WorkerScheduler.getInstance();
    scheduler.create({
      workerId: worker.id,
      workerName: worker.name,
      task: scheduledTaskText.trim(),
      cronExpression: scheduledCron,
    });

    toast('Agendamento Ativo', 'A tarefa recorrente de negócios foi salva com sucesso!', 'success');
    setScheduledTaskText('');
    loadData();
  };

  const handleToggleSchedule = (id: string) => {
    const scheduler = WorkerScheduler.getInstance();
    scheduler.toggleStatus(id);
    loadData();
  };

  const handleDeleteSchedule = (id: string) => {
    const scheduler = WorkerScheduler.getInstance();
    scheduler.delete(id);
    toast('Agendamento Removido', 'O agendamento cron foi excluído.', 'warning');
    loadData();
  };

  const handleTriggerScheduleNow = async (schId: string) => {
    const scheduler = WorkerScheduler.getInstance();
    const sch = schedules.find((s) => s.id === schId);
    if (!sch) return;

    const worker = workers.find((w) => w.id === sch.workerId);
    if (!worker) {
      toast('Erro', 'Trabalhador associado ao agendamento não encontrado ou desativado.', 'danger');
      return;
    }

    toast('Execução Forçada', `Iniciando job recorrente para: ${worker.name}`, 'info');

    try {
      const runResult = await scheduler.triggerImmediately(schId, worker);
      WorkerManager.getInstance().addHistoryEntry(runResult);
      toast('Job Concluído', 'A tarefa cron simulada foi finalizada e registrada no histórico.', 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast('Falha no Job', msg, 'danger');
    }
  };

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'installed' && w.installed) ||
      (selectedStatus === 'not_installed' && !w.installed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="tools"
        title="Business AI Workforce"
        breadcrumbs={[{ label: 'Automação' }, { label: 'Trabalhadores Digitais' }]}
        onCreateAgentClick={() => setActiveTab('builder')}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Main Top Intro Banner */}
          <div className="border-border bg-gradient-to-tr from-violet-500/10 via-transparent to-primary/5 rounded-2xl border p-6 shadow-xs select-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 text-left">
                <span className="bg-violet-500/15 text-violet-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Próxima Geração de Automação de Negócios
                </span>
                <h2 className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
                  Força de Trabalho Digital de IA
                </h2>
                <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
                  Delegue tarefas estruturadas do dia a dia a trabalhadores de IA especializados.
                  Cada assistente é pré-configurado com ferramentas específicas, prompt de foco, memória de longo prazo e compliance com RBAC.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant={activeTab === 'marketplace' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('marketplace')}
                >
                  Mercado de IA
                </Button>
                <Button
                  variant={activeTab === 'builder' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('builder')}
                >
                  Criar Trabalhador
                </Button>
                <Button
                  variant={activeTab === 'scheduler' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('scheduler')}
                >
                  Agendador Cron
                </Button>
              </div>
            </div>
          </div>

          {/* ACTIVE WORKSPACE EDITOR DRAWER / CONFIG PANEL */}
          {editingWorker && (
            <div className="bg-neutral-light/20 border-border border rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{editingWorker.avatar}</span>
                  <div>
                    <h3 className="text-text-primary font-bold text-base">Configurar Trabalhador: {editingWorker.name}</h3>
                    <p className="text-text-muted text-xs">Ajuste as diretrizes de prompt e conectores em tempo de execução.</p>
                  </div>
                </div>
                <Button variant="ghost" size="xs" onClick={() => setEditingWorker(null)}>Fechar</Button>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Modelo de Linguagem (LLM)"
                    value={editLlm}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditLlm(e.target.value)}
                  >
                    {AVAILABLE_LLMS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>

                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary text-sm font-medium">Temperatura</span>
                      <span className="text-primary text-sm font-semibold">{editTemperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={editTemperature}
                      onChange={(e) => setEditTemperature(parseFloat(e.target.value))}
                      className="bg-border accent-primary h-1.5 w-full cursor-pointer rounded-lg appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <span className="text-text-primary text-sm font-semibold">Conectores de Ferramentas / MCP Plugins</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVAILABLE_PLUGINS.map((p) => {
                      const isChecked = editTools.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setEditTools((prev) =>
                              prev.includes(p.id) ? prev.filter((t) => t !== p.id) : [...prev, p.id],
                            );
                          }}
                          className={`flex items-center justify-between px-3 py-2 border rounded-xl transition-all duration-200 text-xs text-left ${isChecked ? 'bg-primary/10 border-primary/40 text-text-primary font-semibold' : 'bg-surface border-border text-text-secondary'}`}
                        >
                          <span>{p.name}</span>
                          <span className={`h-2 w-2 rounded-full ${isChecked ? 'bg-primary' : 'bg-transparent'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  label="Instruções de Foco (System Instructions)"
                  value={editInstructions}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditInstructions(e.target.value)}
                  rows={4}
                />

                <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditingWorker(null)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TESTING COGNITIVE SANDBOX EXECUTION */}
          {testingWorker && (
            <div className="bg-primary/5 border-primary/20 border-2 rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-4 duration-300 text-left">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-bounce">{testingWorker.avatar}</span>
                  <div>
                    <h3 className="text-text-primary font-bold text-base">Sandbox de Execução: {testingWorker.name}</h3>
                    <p className="text-text-muted text-xs">Forçar uma instrução específica em ambiente isolado para auditar comportamento.</p>
                  </div>
                </div>
                <Button variant="ghost" size="xs" onClick={() => setTestingWorker(null)}>Fechar Sandbox</Button>
              </div>

              <form onSubmit={handleRunTest} className="space-y-4">
                <Input
                  label="Instrução Operacional (Task Request)"
                  value={testTask}
                  onChange={(e) => setTestTask(e.target.value)}
                  placeholder="Ex: Analisar os últimos lançamentos do banco e alertar sobre discrepâncias..."
                  disabled={executionRunning}
                />

                {executionRunning && (
                  <div className="bg-surface border-border border rounded-xl p-4 space-y-2 select-none animate-pulse">
                    <div className="flex justify-between items-center text-xs text-text-secondary">
                      <span className="font-semibold text-primary">{executionStep}</span>
                      <span>{executionProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-light rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${executionProgress}%` }} />
                    </div>
                  </div>
                )}

                {executionOutput && (
                  <div className="bg-surface border-border border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-text-muted border-b pb-1.5 border-border/30">
                      <span>Resultado da Heurística Cognitiva</span>
                      <span className="text-[10px] text-success bg-success/15 px-1.5 py-0.5 rounded-full uppercase">Finished</span>
                    </div>
                    <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                      {executionOutput}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setTestingWorker(null)} disabled={executionRunning}>
                    Fechar
                  </Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={executionRunning}>
                    {executionRunning ? 'Processando...' : 'Executar Agora'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: WORKSPACE MARKETPLACE CATALOG */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border select-none">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Pesquisar trabalhador..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 w-full sm:w-auto overflow-x-auto">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-neutral-light border border-border text-text-secondary'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 w-full sm:w-auto shrink-0 select-none">
                  <Select
                    value={selectedStatus}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value as 'all' | 'installed' | 'not_installed')}
                    className="py-1 px-2.5 text-xs bg-surface border border-border"
                  >
                    <option value="all">Todos os estados</option>
                    <option value="installed">Instalados</option>
                    <option value="not_installed">Marketplace Presets</option>
                  </Select>
                </div>
              </div>

              {/* Workers Grid */}
              {filteredWorkers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkers.map((w) => {
                    const isCustom = w.id.includes('worker-custom-') || w.id.includes('worker-dup-');
                    return (
                      <Card key={w.id} className={`hover:border-primary/20 border-border transition-all duration-200 flex flex-col justify-between ${!w.installed ? 'bg-card/40 opacity-80' : 'bg-card'}`}>
                        {/* Header info */}
                        <div className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl bg-neutral-light/40 h-12 w-12 rounded-xl flex items-center justify-center border border-border/20">{w.avatar}</span>
                              <div className="text-left">
                                <h4 className="text-text-primary text-sm font-bold tracking-tight inline-flex items-center gap-1.5">
                                  {w.name}
                                  {!w.installed && (
                                    <span className="text-[9px] bg-neutral-light text-text-muted px-1.5 py-0.2 rounded font-bold uppercase">PRESET</span>
                                  )}
                                </h4>
                                <p className="text-text-muted text-[10px]">{w.category}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 font-extrabold text-[10px] px-2 py-0.5 rounded-full select-none">
                              <Star className="h-3 w-3 fill-amber-500" />
                              {w.rating.toFixed(1)}
                            </div>
                          </div>

                          <p className="text-text-secondary text-xs line-clamp-3 leading-relaxed text-left">
                            {w.description}
                          </p>

                          {/* Capabilities/Capabilities Tags list */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {w.tags.map((tag) => (
                              <span key={tag} className="text-[10px] bg-neutral-light/50 border text-text-muted px-2 py-0.5 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Tools & Workflow bindings */}
                          <div className="border-t border-border/40 pt-3 flex flex-col gap-1 text-[10px] text-left text-text-muted">
                            <p><strong>Plugins/Tools:</strong> {w.tools.length > 0 ? w.tools.join(', ') : 'Raciocínio Base'}</p>
                            {w.workflow && (
                              <p className="text-primary font-semibold"><strong>Workflow Padrão:</strong> {w.workflow}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions footer */}
                        <div className="border-t border-border/40 px-5 py-3.5 bg-neutral-light/20 rounded-b-2xl flex items-center justify-between">
                          <div className="flex gap-2">
                            {w.installed && (
                              <>
                                <button
                                  onClick={() => handleToggleEnable(w.id)}
                                  title={w.enabled ? 'Desativar Assistente' : 'Ativar Assistente'}
                                  className="text-text-secondary hover:text-text-primary"
                                >
                                  {w.enabled ? <ToggleRight className="h-6 w-6 text-success" /> : <ToggleLeft className="h-6 w-6 text-text-muted" />}
                                </button>
                                <button
                                  onClick={() => handleConfigureClick(w)}
                                  title="Ajustar Configurações"
                                  className="text-text-secondary hover:text-primary transition-colors"
                                >
                                  <Settings className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => setTestingWorker(w)}
                                  title="Testar Execução Sandbox"
                                  className="text-text-secondary hover:text-accent transition-colors"
                                >
                                  <Activity className="h-4.5 w-4.5" />
                                </button>
                              </>
                            )}
                          </div>

                          <div className="flex gap-2 items-center">
                            {w.installed ? (
                              <>
                                <button
                                  onClick={() => handleDuplicate(w.id)}
                                  title="Duplicar Trabalhador"
                                  className="text-text-secondary hover:text-primary transition-colors"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                {isCustom ? (
                                  <button
                                    onClick={() => handleDeleteCustom(w.id)}
                                    title="Remover Trabalhador Customizado"
                                    className="text-text-secondary hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUninstall(w.id)}
                                    title="Desinstalar"
                                    className="text-text-secondary hover:text-orange-500 transition-colors text-xs font-bold"
                                  >
                                    Desinstalar
                                  </button>
                                )}
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="xs"
                                leftIcon={<Download className="h-3 w-3" />}
                                onClick={() => handleInstall(w.id)}
                              >
                                Instalar
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-12 text-center select-none">
                  <Cpu className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-primary text-sm font-bold">Nenhum trabalhador encontrado</p>
                  <p className="text-text-muted text-xs mt-1">Experimente alterar os termos de pesquisa ou filtros de categoria.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISUAL WORKER BUILDER */}
          {activeTab === 'builder' && (
            <Card className="p-6 md:p-8 space-y-6 border-border bg-card animate-in fade-in duration-300">
              <div className="border-b border-border/50 pb-4">
                <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Visual AI Architect</span>
                <h2 className="text-text-primary text-xl font-extrabold tracking-tight">Criar Trabalhador Customizado</h2>
                <p className="text-text-secondary text-xs">Desenhe as diretrizes heuristicas, conectores de dados e permissões corporativas para sua nova entidade.</p>
              </div>

              <form onSubmit={handleCreateWorker} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-4">
                    <Input
                      label="Nome do Trabalhador"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Consultor Fiscal Sênior"
                    />

                    <Textarea
                      label="Descrição Executiva"
                      value={description}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                      placeholder="Ex: Audita notas fiscais corporativas e confere alíquotas automáticas em planilhas notion..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Select Avatar */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-text-primary text-sm font-medium">Avatar Eletivo</span>
                      <div className="grid grid-cols-5 gap-2 border border-border bg-surface rounded-xl p-3 max-h-[120px] overflow-y-auto">
                        {AVAILABLE_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setAvatar(emoji)}
                            className={`text-xl p-1 rounded hover:bg-neutral-light transition-all ${avatar === emoji ? 'bg-primary/20 scale-110 font-bold border border-primary/40' : ''}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Select
                    label="Categoria"
                    value={category}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>

                  <Select
                    label="Modelo de Linguagem (LLM)"
                    value={llm}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setLlm(e.target.value)}
                  >
                    {AVAILABLE_LLMS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>

                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary text-sm font-medium">Temperatura Cognitiva</span>
                      <span className="text-primary text-sm font-semibold">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="bg-border accent-primary h-1.5 w-full cursor-pointer rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* Workflow select */}
                <Select
                  label="Workflow Automatizado Padrão (Opcional)"
                  value={defaultWorkflow}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setDefaultWorkflow(e.target.value)}
                >
                  <option value="">Nenhum - Ativação Heurística LLM Direta</option>
                  {workflows.map((wf: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <option key={wf.id} value={wf.id}>{wf.name} ({wf.nodes.length} nós)</option>
                  ))}
                </Select>

                {/* Tool Selection */}
                <div className="space-y-2 text-left">
                  <span className="text-text-primary text-sm font-semibold">Ferramentas Pré-Configuradas (MCP Plugins)</span>
                  <p className="text-text-muted text-[10px] -mt-1">Selecione quais fontes e APIs do ecossistema o trabalhador poderá invocar.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVAILABLE_PLUGINS.map((p) => {
                      const isChecked = selectedPlugins.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlugin(p.id)}
                          className={`flex items-center justify-between px-3 py-2.5 border rounded-xl transition-all duration-200 text-xs text-left ${isChecked ? 'bg-primary/10 border-primary/40 text-text-primary font-semibold shadow-xs' : 'bg-surface border-border text-text-secondary hover:bg-neutral-light'}`}
                        >
                          <span>{p.name}</span>
                          <span className={`h-2.5 w-2.5 rounded-full border border-border ${isChecked ? 'bg-primary' : 'bg-transparent'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Permissions & RBAC */}
                <div className="space-y-2 text-left">
                  <span className="text-text-primary text-sm font-semibold">Permissões de Segurança & RBAC</span>
                  <p className="text-text-muted text-[10px] -mt-1">Controle o nível de isolamento de governança deste robô.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVAILABLE_PERMISSIONS.map((p) => {
                      const isChecked = selectedPermissions.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePermission(p.id)}
                          className={`flex items-center justify-between px-3 py-2.5 border rounded-xl transition-all duration-200 text-xs text-left ${isChecked ? 'bg-indigo-500/10 border-indigo-500/40 text-text-primary font-semibold shadow-xs' : 'bg-surface border-border text-text-secondary hover:bg-neutral-light'}`}
                        >
                          <span>{p.name}</span>
                          <span className={`h-2.5 w-2.5 rounded-full border border-border ${isChecked ? 'bg-indigo-500' : 'bg-transparent'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label="Knowledge Base (Termos ou Tags de Domínio separados por vírgula)"
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    placeholder="Ex: Regulamento Interno, Manual de Redação, Código Tributário 2025"
                  />

                  <Textarea
                    label="Instruções Heurísticas de Raciocínio (Prompt do Sistema)"
                    value={instructions}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                    placeholder="Ex: Você atua estritamente de acordo com as seguintes etapas lógicas..."
                    rows={4}
                  />
                </div>

                <div className="border-t border-border/40 pt-4 flex justify-end gap-3 select-none">
                  <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('marketplace')}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" type="submit" leftIcon={<Plus className="h-4 w-4" />}>
                    Criar & Registrar Trabalhador
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 3: WORKER SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {/* Form Creation */}
              <Card className="p-6 border-border bg-card text-left space-y-5 h-fit select-none">
                <div className="border-b pb-3 border-border/50">
                  <h3 className="text-text-primary text-base font-bold">Novo Agendamento Cron</h3>
                  <p className="text-text-muted text-xs">Crie tarefas automatizadas recorrentes executadas por trabalhadores digitais.</p>
                </div>

                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <Select
                    label="Selecione o Trabalhador de IA"
                    value={scheduledWorkerId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setScheduledWorkerId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {workers.filter((w) => w.installed).map((w) => (
                      <option key={w.id} value={w.id}>{w.avatar} {w.name}</option>
                    ))}
                  </Select>

                  <Input
                    label="Tarefa a Executar"
                    value={scheduledTaskText}
                    onChange={(e) => setScheduledTaskText(e.target.value)}
                    placeholder="Ex: Ler o banco Postgres e enviar sumário ao Slack..."
                  />

                  <Select
                    label="Frequência (Cron Expressão)"
                    value={scheduledCron}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setScheduledCron(e.target.value)}
                  >
                    <option value="A cada 5 minutos (Simulado)">A cada 5 minutos (Simulado)</option>
                    <option value="A cada hora (Simulado)">A cada hora (Simulado)</option>
                    <option value="Diariamente às 09:00">Diariamente às 09:00</option>
                    <option value="Diariamente às 18:00">Diariamente às 18:00</option>
                    <option value="Todas as segundas-feiras às 08:00">Todas as segundas-feiras às 08:00</option>
                  </Select>

                  <Button variant="primary" size="sm" className="w-full" type="submit">
                    Salvar Agendamento
                  </Button>
                </form>
              </Card>

              {/* Schedules list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-text-primary text-sm font-bold tracking-tight">Agendamentos Recorrentes Ativos ({schedules.length})</h3>
                </div>

                <div className="space-y-4">
                  {schedules.map((s) => {
                    const worker = workers.find((w) => w.id === s.workerId);
                    return (
                      <Card key={s.id} className="p-5 border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl bg-neutral-light/50 p-1.5 rounded-lg">{worker?.avatar || '🤖'}</span>
                            <div>
                              <h4 className="text-text-primary text-sm font-bold tracking-tight">{worker?.name || s.workerName}</h4>
                              <p className="text-[10px] text-primary font-bold">{s.cronExpression}</p>
                            </div>
                          </div>
                          <p className="text-text-secondary text-xs pt-1.5 leading-relaxed">&quot;{s.task}&quot;</p>
                          <div className="flex gap-4 pt-1.5 text-[10px] text-text-muted">
                            <span>Último Job: {s.lastRun ? new Date(s.lastRun).toLocaleString('pt-BR') : 'Nunca executado'}</span>
                            <span>Próximo Run: {s.nextRun ? new Date(s.nextRun).toLocaleString('pt-BR') : 'Pausado'}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 animate-in fade-in">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-muted/15 text-text-muted'}`}>
                            {s.status.toUpperCase()}
                          </span>

                          <div className="flex gap-2 pt-1 select-none">
                            <Button variant="outline" size="xs" onClick={() => handleToggleSchedule(s.id)}>
                              {s.status === 'active' ? 'Pausar' : 'Ativar'}
                            </Button>
                            <Button variant="secondary" size="xs" onClick={() => handleTriggerScheduleNow(s.id)}>
                              Forçar Run
                            </Button>
                            <button
                              onClick={() => handleDeleteSchedule(s.id)}
                              className="text-text-secondary hover:text-red-500 p-1.5 transition-colors"
                              title="Remover Agendamento"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {schedules.length === 0 && (
                    <div className="bg-card border rounded-xl p-10 text-center text-text-muted text-xs select-none">
                      Nenhum agendamento cron recorrente registrado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
