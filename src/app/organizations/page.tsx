'use client';

import React, { useState } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useAudit } from '@/context/AuditContext';
import { RouteProtection } from '@/components/security/RouteProtection';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Card } from '@/components/ui/Card';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Power,
  CheckCircle,
  Users,
  Sparkles,
  Database,
  GitBranch,
  Wrench,
  Activity,
} from 'lucide-react';
import { OrganizationPlanType } from '@/organizations/OrganizationPlans';

export default function OrganizationsPage() {
  const {
    organizations,
    activeOrganization,
    switchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    deactivateOrganization,
  } = useOrganization();

  const { logAction } = useAudit();

  // Form states
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [plan, setPlan] = useState<OrganizationPlanType>('Starter');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit states
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editPlan, setEditPlan] = useState<OrganizationPlanType>('Starter');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    createOrganization(name, logo, plan);
    logAction(
      'organization.create',
      `Criou a organização "${name}" com o plano ${plan}.`,
    );
    setName('');
    setLogo('');
    setPlan('Starter');
    setShowCreateForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrgId || !editName) return;

    updateOrganization(editingOrgId, {
      name: editName,
      logo: editLogo,
      plan: editPlan,
    });

    logAction(
      'organization.update',
      `Editou as configurações da organização "${editName}".`,
    );

    setEditingOrgId(null);
  };

  const handleSwitch = (id: string, orgName: string) => {
    try {
      switchOrganization(id);
      logAction(
        'organization.switch',
        `Alternou com sucesso a sessão para a organização ativa "${orgName}".`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Erro ao alternar organização: ${msg}`);
    }
  };

  const handleDelete = (id: string, orgName: string) => {
    if (confirm(`Tem certeza de que deseja excluir permanentemente a organização "${orgName}"?`)) {
      try {
        deleteOrganization(id);
        logAction(
          'organization.delete',
          `Excluiu com sucesso a organização "${orgName}".`,
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert(msg);
      }
    }
  };

  const handleDeactivate = (id: string, orgName: string) => {
    try {
      deactivateOrganization(id);
      logAction(
        'organization.deactivate',
        `Desativou a organização "${orgName}".`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg);
    }
  };

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="admin"
        title="Gerenciador de Organizações Multi-Tenant"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Organizações' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Top Banner explaining Multi-Tenant isolation */}
          <Card className="p-6 border-violet-500/20 bg-gradient-to-r from-violet-950/20 via-slate-900 to-slate-950 text-left space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-400 animate-pulse" /> Arquitetura Enterprise Multi-Organization (Multi-Tenant)
            </h3>
            <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
              O AgentOps AI Studio opera sob isolamento estrito de Tenant. Alternar a organização ativa altera dinamicamente o escopo de carregamento e manipulação de todos os recursos do sistema: Usuários, Agentes/Workers, Plugins, Workflows, Logs de Auditoria, Dashboards e Memórias RAG.
            </p>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Lista de Organizações Corporativas</h3>
              <p className="text-xs text-slate-400">Gerencie planos, limites e controle de desativação de tenants.</p>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingOrgId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition cursor-pointer animate-in fade-in"
            >
              <Plus className="h-4 w-4" /> Nova Organização
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Card className="p-5 border-slate-800 bg-slate-900/80 backdrop-blur-md">
              <form onSubmit={handleCreate} className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-400" /> Cadastrar Nova Organização Isolada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Nome da Organização</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Acme Corp"
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Iniciais / Logo</label>
                    <input
                      type="text"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="Ex: AC"
                      maxLength={3}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Plano de Contratação</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value as OrganizationPlanType)}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    >
                      <option value="Starter">Starter (Desenvolvimento / Testes)</option>
                      <option value="Pro">Pro (Crescimento Corporativo)</option>
                      <option value="Enterprise">Enterprise (Acesso Total Ilimitado)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    Salvar e Registrar
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Edit Form */}
          {editingOrgId && (
            <Card className="p-5 border-yellow-500/20 bg-slate-900/90 backdrop-blur-md">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                  <Edit2 className="h-4 w-4" /> Editar Configurações de Organização
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Nome da Organização</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Iniciais / Logo</label>
                    <input
                      type="text"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                      maxLength={3}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Plano de Contratação</label>
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as OrganizationPlanType)}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingOrgId(null)}
                    className="rounded px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-yellow-600 hover:bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    Atualizar Informações
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Grid of Existing Organizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.map((org) => {
              const isActive = activeOrganization?.id === org.id;
              const isDefault = org.id === 'org-default';

              return (
                <Card
                  key={org.id}
                  className={`p-5 text-left bg-slate-900 border-slate-800 transition flex flex-col justify-between space-y-4 ${
                    isActive ? 'ring-2 ring-violet-500 bg-slate-900/90' : 'hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm">
                          {org.logo}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans leading-none">
                            {org.name}
                          </h4>
                          <span className="text-[9px] uppercase font-mono text-slate-500 mt-1 block">
                            ID: {org.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                            org.plan === 'Enterprise'
                              ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15'
                              : org.plan === 'Pro'
                              ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15'
                              : 'text-slate-400 bg-slate-500/10 border-slate-500/15'
                          }`}
                        >
                          Plano {org.plan}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            org.status === 'active'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                              : 'text-red-400 bg-red-500/10 border-red-500/15'
                          }`}
                        >
                          {org.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    {/* Resources Count Badges */}
                    <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-center">
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800/50">
                        <Users className="h-3.5 w-3.5 text-violet-400 mx-auto mb-0.5" />
                        <span className="text-[10px] font-bold text-slate-200">{org.users.length}</span>
                        <p className="text-[8px] text-slate-500">Membros</p>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800/50">
                        <Activity className="h-3.5 w-3.5 text-violet-400 mx-auto mb-0.5" />
                        <span className="text-[10px] font-bold text-slate-200">{org.workers.length}</span>
                        <p className="text-[8px] text-slate-500">Workers</p>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800/50">
                        <Wrench className="h-3.5 w-3.5 text-amber-500 mx-auto mb-0.5" />
                        <span className="text-[10px] font-bold text-slate-200">{org.plugins.length}</span>
                        <p className="text-[8px] text-slate-500">Plugins</p>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800/50">
                        <GitBranch className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-0.5" />
                        <span className="text-[10px] font-bold text-slate-200">{org.workflows.length}</span>
                        <p className="text-[8px] text-slate-500">Workflows</p>
                      </div>
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800/50">
                        <Database className="h-3.5 w-3.5 text-indigo-400 mx-auto mb-0.5" />
                        <span className="text-[10px] font-bold text-slate-200">{org.dashboards.length}</span>
                        <p className="text-[8px] text-slate-500">KPIs</p>
                      </div>
                    </div>

                    {/* Limits Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-slate-400">Armazenamento de Memória RAG</span>
                        <span className="font-mono text-slate-300">
                          Max: {(org.limits.maxMemoryUsageBytes / (1024 * 1024)).toFixed(0)} MB
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/50">
                        <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                      Registrada em: {new Date(org.createdAt).toLocaleDateString()} &bull; Owner: {org.ownerId}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2.5">
                    {/* Switcher Button */}
                    {isActive ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/15 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" /> Organização Ativa
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitch(org.id, org.name)}
                        disabled={org.status !== 'active'}
                        className={`rounded px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                          org.status === 'active'
                            ? 'bg-violet-600 hover:bg-violet-500 text-white'
                            : 'bg-slate-950 text-slate-500 cursor-not-allowed border border-slate-800'
                        }`}
                      >
                        Ativar Workspace
                      </button>
                    )}

                    {/* Admin Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingOrgId(org.id);
                          setEditName(org.name);
                          setEditLogo(org.logo);
                          setEditPlan(org.plan);
                          setShowCreateForm(false);
                        }}
                        title="Editar organização"
                        className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {org.status === 'active' && !isDefault && (
                        <button
                          onClick={() => handleDeactivate(org.id, org.name)}
                          title="Desativar organização"
                          className="p-1 rounded bg-slate-950 hover:bg-red-950/20 border border-slate-800 text-red-400 hover:text-red-300 transition cursor-pointer"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {!isDefault && (
                        <button
                          onClick={() => handleDelete(org.id, org.name)}
                          title="Excluir organização"
                          className="p-1 rounded bg-slate-950 hover:bg-red-950 border border-slate-800 text-red-500 hover:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
