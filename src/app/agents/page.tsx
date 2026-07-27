'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Cpu,
  ChevronLeft,
  Settings,
  FileText,
} from 'lucide-react';

import { useAgents } from '@/context/AgentContext';
import { Agent } from '@/types/agent';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { WorkspaceEmptyState } from '@/components/workspace/WorkspaceEmptyState';
import { AgentToolbar } from '@/components/agents/AgentToolbar';
import { AgentCard } from '@/components/agents/AgentCard';
import { CreateAgentModal } from '@/components/agents/CreateAgentModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';

const AVAILABLE_MODELS = [
  'Claude 3.5 Sonnet (Default)',
  'GPT-4o Advanced',
  'GPT-4o Mini',
  'Llama 3.1 8B (Local)',
  'Llama 3.1 70B',
  'Gemini 1.5 Pro',
];

const SPECIALTIES = [
  'Data Science',
  'Database Operations',
  'Business Intelligence',
  'Finance',
  'Legal & Compliance',
  'Human Resources',
  'Marketing',
  'General Assistant',
];

function AgentsContent() {
  const {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
    toggleAgentStatus,
  } = useAgents();

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Selected agent state for the workspace editor
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Form states for the workspace editor (synced with selectedAgent)
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editTemperature, setEditTemperature] = useState(0.4);
  const [editSystemPrompt, setEditSystemPrompt] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  // Toolbar & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAgentInModal, setEditingAgentInModal] = useState<Agent | undefined>(undefined);

  // Sync selectedAgent form fields (asynchronously to avoid ESLint rules warnings)
  useEffect(() => {
    if (selectedAgent) {
      setTimeout(() => {
        setEditName(selectedAgent.name);
        setEditSpecialty(selectedAgent.specialty);
        setEditDescription(selectedAgent.description);
        setEditObjective(selectedAgent.objective);
        setEditModel(selectedAgent.model);
        setEditTemperature(selectedAgent.temperature);
        setEditSystemPrompt(selectedAgent.systemPrompt);
        setEditStatus(selectedAgent.status);
      }, 0);
    }
  }, [selectedAgent]);

  // Read URL query parameters to open specific agent (asynchronously to avoid ESLint rules warnings)
  useEffect(() => {
    const selectId = searchParams.get('select');
    if (selectId) {
      const found = agents.find((a) => a.id === selectId);
      if (found) {
        setTimeout(() => {
          setSelectedAgent(found);
          router.replace('/agents');
        }, 0);
      }
    }
  }, [searchParams, agents, router]);

  // Handle Quick Create / Save
  const handleCreateAgent = (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAgentInModal) {
      updateAgent(editingAgentInModal.id, data);
      // Sync workspace view if currently editing this selected agent
      if (selectedAgent?.id === editingAgentInModal.id) {
        setSelectedAgent({
          ...selectedAgent,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }
      setEditingAgentInModal(undefined);
    } else {
      addAgent(data);
    }
    setIsCreateModalOpen(false);
  };

  const handleWorkspaceSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    if (!editName.trim()) {
      toast('Erro de Validação', 'O nome do agente é obrigatório.', 'danger');
      return;
    }

    const updatedData: Partial<Agent> = {
      name: editName.trim(),
      specialty: editSpecialty,
      description: editDescription.trim(),
      objective: editObjective.trim(),
      model: editModel,
      temperature: editTemperature,
      systemPrompt: editSystemPrompt.trim(),
      status: editStatus,
    };

    updateAgent(selectedAgent.id, updatedData);

    // Update active selected state in workspace
    setSelectedAgent({
      ...selectedAgent,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEditInModal = (agent: Agent) => {
    setEditingAgentInModal(agent);
    setIsCreateModalOpen(true);
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm('Deseja realmente remover este agente? Esta ação é irreversível.')) {
      deleteAgent(id);
      if (selectedAgent?.id === id) {
        setSelectedAgent(null);
      }
    }
  };

  const handleDuplicateAgent = (id: string) => {
    duplicateAgent(id);
  };

  const handleToggleStatus = (id: string) => {
    toggleAgentStatus(id);
    if (selectedAgent?.id === id) {
      setEditStatus((prev) => (prev === 'active' ? 'inactive' : 'active'));
    }
  };

  // Filter & sort list of agents for standard catalog view
  const filteredAgents = agents
    .filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const matchesSpecialty = specialtyFilter === 'all' || agent.specialty === specialtyFilter;

      return matchesSearch && matchesStatus && matchesSpecialty;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // default: updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Properties Panel for the selected Workspace Editor
  const propertiesPanel = selectedAgent ? (
    <div className="space-y-6 select-none">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Settings className="h-4 w-4 text-primary" />
        <h3 className="text-text-primary text-sm font-bold tracking-tight">
          Painel de Propriedades
        </h3>
      </div>

      <div className="space-y-5">
        {/* State status active/inactive */}
        <div className="bg-neutral-light/30 border-border/40 rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-text-primary text-xs font-semibold">Estado do Agente</span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                editStatus === 'active' ? 'text-success' : 'text-text-muted'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${editStatus === 'active' ? 'bg-success' : 'bg-text-muted/50'}`} />
              {editStatus === 'active' ? 'Disponível' : 'Pausado'}
            </span>
          </div>
          <Switch
            label="Instância em Produção"
            checked={editStatus === 'active'}
            onChange={() => setEditStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))}
          />
        </div>

        {/* Model Selection */}
        <Select
          label="Modelo Base (Simulado)"
          value={editModel}
          onChange={(e) => setEditModel(e.target.value)}
          helperText="Selecione o cérebro cognitivo do agente"
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        {/* Temperature slider */}
        <div className="flex flex-col gap-1.5">
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
          <p className="text-text-muted text-[10px]">
            Valores baixos fornece respostas focadas e estruturadas.
          </p>
        </div>

        {/* Action Save button */}
        <div className="border-t border-border/50 pt-4 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedAgent(null)}
            className="w-full text-xs"
          >
            Fechar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleWorkspaceSave}
            className="w-full text-xs"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  ) : undefined;

  return (
    <WorkspaceLayout
      activePath="agents"
      title={selectedAgent ? `Playground: ${selectedAgent.name}` : 'Agentes Disponíveis'}
      breadcrumbs={
        selectedAgent
          ? [{ label: 'Playground' }, { label: selectedAgent.name }]
          : [{ label: 'Studio' }, { label: 'Catálogo de Agentes' }]
      }
      agents={agents}
      selectedAgentId={selectedAgent?.id}
      onAgentSelect={(agent) => setSelectedAgent(agent)}
      onCreateAgentClick={() => {
        setEditingAgentInModal(undefined);
        setIsCreateModalOpen(true);
      }}
      propertiesPanel={propertiesPanel}
      headerActions={
        selectedAgent ? (
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => setSelectedAgent(null)}
          >
            Voltar ao Catálogo
          </Button>
        ) : undefined
      }
    >
      {selectedAgent ? (
        /* WORKSPACE INTERACTIVE CANVAS SPLIT VIEW */
        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto space-y-6">
          <Card className="p-6 md:p-8 space-y-6 border-border bg-card">
            <div className="flex flex-col gap-1 border-b border-border/50 pb-4 select-none">
              <span className="text-primary text-[10px] font-bold uppercase tracking-wider">
                Workspace Ativo
              </span>
              <h2 className="text-text-primary text-xl font-extrabold tracking-tight">
                Instruções & Foco do Agente
              </h2>
              <p className="text-text-secondary text-xs">
                Refine as especialidades de negócio e objetivos funcionais deste assistente cognitivo.
              </p>
            </div>

            <form onSubmit={handleWorkspaceSave} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Nome do Agente"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <Select
                  label="Especialidade"
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                >
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </Select>
              </div>

              <Input
                label="Objetivo de Negócio Primário"
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value)}
                helperText="O que este agente deve resolver prioritariamente nas automações?"
              />

              <Textarea
                label="Descrição Resumida"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />

              <div className="bg-neutral-light/20 border-border/40 rounded-xl border p-4 space-y-3">
                <div className="flex items-center gap-2 text-text-primary text-xs font-bold tracking-wider uppercase select-none">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Prompt de Instrução Base (System Prompt)</span>
                </div>
                <Textarea
                  value={editSystemPrompt}
                  onChange={(e) => setEditSystemPrompt(e.target.value)}
                  placeholder="Instruções e contextos comportamentais para o LLM..."
                  rows={6}
                />
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedAgent(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        /* STANDARD AGENTS CATALOG GRID / LIST VIEW */
        <div className="animate-in fade-in duration-300 space-y-6 max-w-7xl mx-auto">
          {/* Main Toolbar */}
          <AgentToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            specialtyFilter={specialtyFilter}
            onSpecialtyFilterChange={setSpecialtyFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateClick={() => {
              setEditingAgentInModal(undefined);
              setIsCreateModalOpen(true);
            }}
          />

          {/* Catalog grid elements */}
          {filteredAgents.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={handleEditInModal}
                  onDuplicate={handleDuplicateAgent}
                  onDelete={handleDeleteAgent}
                  onToggleStatus={handleToggleStatus}
                  onSelect={(selected) => setSelectedAgent(selected)}
                />
              ))}
            </div>
          ) : (
            <WorkspaceEmptyState
              title="Nenhum Agente Encontrado"
              description="Nenhum agente corresponde aos filtros de busca ou especialidade selecionados atualmente."
              actionLabel="Resetar Filtros de Busca"
              onActionClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSpecialtyFilter('all');
                setSortBy('updated');
              }}
            />
          )}
        </div>
      )}

      {/* Dynamic Creation / Edit Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAgentInModal(undefined);
        }}
        initialData={editingAgentInModal}
        onSubmit={handleCreateAgent}
      />
    </WorkspaceLayout>
  );
}

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-3">
            <Cpu className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-semibold tracking-wide text-text-muted">
              Carregando Playground...
            </span>
          </div>
        </div>
      }
    >
      <AgentsContent />
    </Suspense>
  );
}
