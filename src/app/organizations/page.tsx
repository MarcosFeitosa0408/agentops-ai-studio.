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
  Mail,
  Sliders,
  Award,
  Search,
  UserPlus,
  Lock,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { OrganizationPlanType } from '@/organizations/OrganizationPlans';
import { OrganizationRole } from '@/organizations/OrganizationRoles';

type TabType = 'overview' | 'members' | 'invitations' | 'settings' | 'plans';

export default function OrganizationsPage() {
  const {
    organizations,
    activeOrganization,
    switchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    deactivateOrganization,

    // Membership state
    activeMembers,
    activeInvitations,

    // Membership Actions
    inviteMember,
    cancelInvitation,
    createMemberDirectly,
    changeMemberRole,
    suspendMember,
    reactivateMember,
    removeMember,
  } = useOrganization();

  const { logAction } = useAudit();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // New Org Form states
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [plan, setPlan] = useState<OrganizationPlanType>('Starter');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit Org states
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editPlan, setEditPlan] = useState<OrganizationPlanType>('Starter');

  // Search & Filters for Members
  const [memberSearch, setMembersSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Invite Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('Viewer');
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Create Member Directly states
  const [directUserId, setDirectUserId] = useState('');
  const [directName, setDirectName] = useState('');
  const [directEmail, setDirectEmail] = useState('');
  const [directRole, setDirectRole] = useState<OrganizationRole>('Viewer');
  const [showDirectForm, setShowDirectForm] = useState(false);

  // Edit Role modal states
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberRole, setEditMemberRole] = useState<OrganizationRole>('Viewer');

  // Settings form states (isolated copy from activeOrganization settings)
  const [mfa, setMfa] = useState(false);
  const [timeout, setTimeoutVal] = useState(120);
  const [theme, setTheme] = useState('#6d28d9');

  // Initialize settings copies when Settings Tab is opened
  React.useEffect(() => {
    if (activeOrganization) {
      const timer = setTimeout(() => {
        setMfa(activeOrganization.settings.requireMFA);
        setTimeoutVal(activeOrganization.settings.sessionTimeoutMinutes);
        setTheme(activeOrganization.settings.themeColor);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeOrganization, activeTab]);

  const handleCreateOrg = (e: React.FormEvent) => {
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

  const handleEditOrgSubmit = (e: React.FormEvent) => {
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

  const handleSwitchOrg = (id: string, orgName: string) => {
    try {
      switchOrganization(id);
      logAction(
        'organization.switch',
        `Alternou com sucesso a sessão para a organização ativa "${orgName}".`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro ao alternar organização: ${msg}`);
    }
  };

  const handleDeleteOrg = (id: string, orgName: string) => {
    if (confirm(`Tem certeza de que deseja excluir permanentemente a organização "${orgName}"?`)) {
      try {
        deleteOrganization(id);
        logAction(
          'organization.delete',
          `Excluiu com sucesso a organização "${orgName}".`,
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(msg);
      }
    }
  };

  const handleDeactivateOrg = (id: string, orgName: string) => {
    try {
      deactivateOrganization(id);
      logAction(
        'organization.deactivate',
        `Desativou a organização "${orgName}".`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  // Membership Submissions
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      inviteMember(inviteEmail, inviteRole);
      logAction(
        'organization.member_invite',
        `Enviou convite de membro para "${inviteEmail}" com papel "${inviteRole}".`
      );
      setInviteEmail('');
      setShowInviteForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleDirectMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUserId || !directName || !directEmail) return;

    try {
      createMemberDirectly(directUserId, directName, directEmail, directRole);
      logAction(
        'organization.member_create',
        `Adicionou diretamente o membro "${directName}" com papel "${directRole}".`
      );
      setDirectUserId('');
      setDirectName('');
      setDirectEmail('');
      setShowDirectForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleChangeRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId) return;

    try {
      changeMemberRole(editingMemberId, editMemberRole);
      logAction(
        'organization.member_role_change',
        `Alterou o papel do membro id "${editingMemberId}" para "${editMemberRole}".`
      );
      setEditingMemberId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleToggleMemberSuspension = (memberId: string, currentStatus: string, name: string) => {
    try {
      if (currentStatus === 'Active') {
        suspendMember(memberId);
        logAction('organization.member_suspend', `Suspendeu o membro "${name}".`);
      } else {
        reactivateMember(memberId);
        logAction('organization.member_reactivate', `Reativou o membro "${name}".`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleRemoveMemberClick = (memberId: string, name: string) => {
    if (confirm(`Tem certeza de que deseja remover o membro "${name}" desta organização?`)) {
      try {
        removeMember(memberId);
        logAction('organization.member_remove', `Removeu o membro "${name}" da organização.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(msg);
      }
    }
  };

  const handleCancelInviteClick = (token: string, email: string) => {
    if (confirm(`Tem certeza de que deseja cancelar o convite enviado para "${email}"?`)) {
      try {
        cancelInvitation(token);
        logAction('organization.invite_cancel', `Cancelou o convite de "${email}".`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(msg);
      }
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;

    try {
      updateOrganization(activeOrganization.id, {
        settings: {
          ...activeOrganization.settings,
          requireMFA: mfa,
          sessionTimeoutMinutes: timeout,
          themeColor: theme,
        },
      });
      logAction('organization.settings_update', 'Atualizou as configurações corporativas de segurança.');
      alert('Configurações salvas com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  // Filter members list based on UI Search & role filter
  const filteredMembers = activeMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="organizations"
        title="Portal Administrativo Enterprise Multi-Tenant"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Organizações' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Dashboard Header explaining Active Organization */}
          {activeOrganization && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-slate-900 border border-slate-800 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                  {activeOrganization.logo}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeOrganization.name}
                    <span className="text-xs px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/15">
                      Ativo
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Plano {activeOrganization.plan} &bull; {activeMembers.length} membros corporativos isolados.
                  </p>
                </div>
              </div>

              {/* Tabs list */}
              <div className="flex flex-wrap bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['overview', 'members', 'invitations', 'settings', 'plans'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md uppercase tracking-wider transition cursor-pointer ${
                      activeTab === tab
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'overview'
                      ? 'Visão Geral'
                      : tab === 'members'
                      ? 'Membros'
                      : tab === 'invitations'
                      ? 'Convites'
                      : tab === 'settings'
                      ? 'Segurança'
                      : 'Plano & Limites'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
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
                  <h3 className="text-sm font-bold text-white">Todas as Organizações Cadastradas</h3>
                  <p className="text-xs text-slate-400">Troque o workspace ativo ou registre novos tenants corporativos.</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(!showCreateForm);
                    setEditingOrgId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Registrar Organização
                </button>
              </div>

              {/* Create Org Form */}
              {showCreateForm && (
                <Card className="p-5 border-slate-800 bg-slate-900/85 backdrop-blur-md animate-in fade-in duration-200">
                  <form onSubmit={handleCreateOrg} className="space-y-4">
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

              {/* Edit Org Form */}
              {editingOrgId && (
                <Card className="p-5 border-yellow-500/20 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
                  <form onSubmit={handleEditOrgSubmit} className="space-y-4">
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
                        <span className="text-[10px] font-bold text-slate-200">
                          {organizations.find((o) => o.id === org.id)?.users?.length || 0}
                        </span>
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
                        onClick={() => handleSwitchOrg(org.id, org.name)}
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
                          onClick={() => handleDeactivateOrg(org.id, org.name)}
                          title="Desativar organização"
                          className="p-1 rounded bg-slate-950 hover:bg-red-950/20 border border-slate-800 text-red-400 hover:text-red-300 transition cursor-pointer"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {!isDefault && (
                        <button
                          onClick={() => handleDeleteOrg(org.id, org.name)}
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
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && activeOrganization && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar membro..."
                      value={memberSearch}
                      onChange={(e) => setMembersSearch(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-9 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-xs"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="all">Todos os papéis</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowDirectForm(!showDirectForm);
                      setShowInviteForm(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-750 hover:text-white transition cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 text-violet-400" /> Adicionar Direto
                  </button>
                  <button
                    onClick={() => {
                      setShowInviteForm(!showInviteForm);
                      setShowDirectForm(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition cursor-pointer"
                  >
                    <Mail className="h-4 w-4" /> Enviar Convite (E-mail)
                  </button>
                </div>
              </div>

              {/* Add Direct Form */}
              {showDirectForm && (
                <Card className="p-5 border-slate-800 bg-slate-900/80 animate-in fade-in duration-200">
                  <form onSubmit={handleDirectMemberSubmit} className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-violet-400" /> Adicionar Membro Diretamente
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">ID de Usuário (SSO)</label>
                        <input
                          type="text"
                          required
                          placeholder="user-999"
                          value={directUserId}
                          onChange={(e) => setDirectUserId(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Nome Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: João Silva"
                          value={directName}
                          onChange={(e) => setDirectName(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">E-mail Corporativo</label>
                        <input
                          type="email"
                          required
                          placeholder="joao@empresa.com"
                          value={directEmail}
                          onChange={(e) => setDirectEmail(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Papel da Organização</label>
                        <select
                          value={directRole}
                          onChange={(e) => setDirectRole(e.target.value as OrganizationRole)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager (Gerente)</option>
                          <option value="Developer">Developer</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Viewer">Viewer</option>
                          <option value="Guest">Guest</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDirectForm(false)}
                        className="rounded px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                      >
                        Adicionar Membro
                      </button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Invite Email Form */}
              {showInviteForm && (
                <Card className="p-5 border-slate-800 bg-slate-900/80 animate-in fade-in duration-200">
                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-violet-400" /> Enviar Convite para Organização
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">E-mail Corporativo do Destinatário</label>
                        <input
                          type="email"
                          required
                          placeholder="colega@empresa.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Papel da Organização</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Developer">Developer</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Viewer">Viewer</option>
                          <option value="Guest">Guest</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="rounded px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                      >
                        Enviar Convite
                      </button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Edit Role Modal Form Inline */}
              {editingMemberId && (
                <Card className="p-5 border-yellow-500/20 bg-slate-900/90 animate-in fade-in duration-200">
                  <form onSubmit={handleChangeRoleSubmit} className="space-y-4">
                    <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                      <Sliders className="h-4 w-4" /> Alterar Papel do Membro
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-xs text-slate-400 self-center">
                        Membro ID: <span className="font-mono text-slate-200">{editingMemberId}</span>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Novo Papel da Organização</label>
                        <select
                          value={editMemberRole}
                          onChange={(e) => setEditMemberRole(e.target.value as OrganizationRole)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        >
                          <option value="Owner">Owner</option>
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Developer">Developer</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Viewer">Viewer</option>
                          <option value="Guest">Guest</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMemberId(null)}
                        className="rounded px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-yellow-600 hover:bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                      >
                        Atualizar Papel
                      </button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Members List Table/Grid */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead className="bg-slate-950 font-bold uppercase tracking-wider text-slate-400 text-left">
                    <tr>
                      <th className="px-6 py-4">Membro</th>
                      <th className="px-6 py-4">ID de Usuário (AD)</th>
                      <th className="px-6 py-4">Papel (Role)</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Último Acesso</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-800/40">
                        {/* Member Name and Email */}
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-violet-600/10 border border-violet-500/25 flex items-center justify-center font-bold text-violet-400">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{member.name}</p>
                            <p className="text-[10px] text-slate-500">{member.email}</p>
                          </div>
                        </td>

                        {/* AD User ID */}
                        <td className="px-6 py-4 font-mono text-slate-400">{member.userId}</td>

                        {/* Organization Role Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              member.role === 'Owner'
                                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15'
                                : member.role === 'Admin'
                                ? 'text-red-400 bg-red-500/10 border-red-500/15'
                                : member.role === 'Manager'
                                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15'
                                : 'text-slate-400 bg-slate-500/10 border-slate-500/15'
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              member.status === 'Active'
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                                : member.status === 'Suspended'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/15'
                                : 'text-red-400 bg-red-500/10 border-red-500/15'
                            }`}
                          >
                            {member.status === 'Active' ? 'Ativo' : member.status}
                          </span>
                        </td>

                        {/* Last Access */}
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                          {new Date(member.lastAccess).toLocaleDateString()} {new Date(member.lastAccess).toLocaleTimeString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right space-x-2">
                          {/* Edit Role */}
                          <button
                            onClick={() => {
                              setEditingMemberId(member.id);
                              setEditMemberRole(member.role);
                              setShowInviteForm(false);
                              setShowDirectForm(false);
                            }}
                            title="Alterar papel"
                            className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                          </button>

                          {/* Suspend/Reactivate */}
                          <button
                            onClick={() => handleToggleMemberSuspension(member.id, member.status, member.name)}
                            title={member.status === 'Active' ? 'Suspender membro' : 'Reativar membro'}
                            className={`p-1 rounded bg-slate-950 border border-slate-800 transition cursor-pointer ${
                              member.status === 'Active'
                                ? 'hover:bg-amber-950/20 text-amber-500 hover:text-amber-400'
                                : 'hover:bg-emerald-950/20 text-emerald-500 hover:text-emerald-400'
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>

                          {/* Remove member */}
                          <button
                            onClick={() => handleRemoveMemberClick(member.id, member.name)}
                            title="Remover membro"
                            className="p-1 rounded bg-slate-950 hover:bg-red-950 border border-slate-800 text-red-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500">
                          Nenhum membro corporativo encontrado nesta pesquisa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVITATIONS */}
          {activeTab === 'invitations' && activeOrganization && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Convites Pendentes e Histórico</h3>
                  <p className="text-xs text-slate-400">Veja e gerencie as admissões enviadas a usuários do diretório AD.</p>
                </div>
                <button
                  onClick={() => {
                    setShowInviteForm(true);
                    setActiveTab('members');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Novo Convite
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead className="bg-slate-950 font-bold uppercase tracking-wider text-slate-400 text-left">
                    <tr>
                      <th className="px-6 py-4">Token do Convite</th>
                      <th className="px-6 py-4">Destinatário</th>
                      <th className="px-6 py-4">Papel Proposto</th>
                      <th className="px-6 py-4">Expiração</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {activeInvitations.map((inv) => (
                      <tr key={inv.token} className="hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-mono text-slate-400">{inv.token}</td>
                        <td className="px-6 py-4 font-bold text-slate-100">{inv.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-slate-700 bg-slate-950 text-slate-400 uppercase">
                            {inv.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                          {new Date(inv.expiration).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              inv.status === 'Pending'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/15'
                                : inv.status === 'Accepted'
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                                : 'text-slate-400 bg-slate-500/10 border-slate-500/15'
                            }`}
                          >
                            {inv.status === 'Pending' ? 'Pendente' : inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {inv.status === 'Pending' && (
                            <button
                              onClick={() => handleCancelInviteClick(inv.token, inv.email)}
                              title="Cancelar convite"
                              className="p-1 rounded bg-slate-950 hover:bg-red-950 border border-slate-800 text-red-500 hover:text-red-400 transition cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {activeInvitations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500">
                          Nenhum convite emitido por esta organização.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && activeOrganization && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-800 bg-slate-900 space-y-4">
                <div className="pb-3 border-b border-slate-800 text-left">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Lock className="h-4.5 w-4.5 text-violet-400" /> Diretrizes de Segurança Corporativa
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Defina chaves, whitelists e fatores de autenticação de usuários do tenant.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* MFA */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="mfa"
                      checked={mfa}
                      onChange={(e) => setMfa(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-850 text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <label htmlFor="mfa" className="text-xs font-bold text-slate-200">Exigir Autenticação Multifator (MFA) para todos os membros</label>
                      <p className="text-[10px] text-slate-500 mt-0.5">Usuários sem segundo fator AD ativo serão bloqueados no login.</p>
                    </div>
                  </div>

                  {/* Timeout */}
                  <div className="max-w-md">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Tempo Limite de Sessão Ociosa (Minutos)</label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <input
                        type="number"
                        min={10}
                        max={1440}
                        value={timeout}
                        onChange={(e) => setTimeoutVal(Number(e.target.value))}
                        className="block w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <span className="text-[11px] text-slate-500">Minutos (Mínimo: 10m, Máximo: 24h)</span>
                    </div>
                  </div>

                  {/* Color Branding */}
                  <div className="max-w-md">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Cor do Branding do Tenant</label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <input
                        type="color"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="h-8 w-12 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-400">{theme.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="rounded bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                    >
                      Salvar Segurança
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB 5: PLANS */}
          {activeTab === 'plans' && activeOrganization && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-800 bg-slate-900 space-y-6">
                <div className="pb-3 border-b border-slate-800 text-left">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-violet-400" /> Plano Contratado & Enquadramento de Limites
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Revise o consumo do seu tenant corporativo contra a apólice.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Users meter */}
                  <Card className="p-4 bg-slate-950 border-slate-850 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Usuários Ativos</span>
                      <span className="font-mono text-slate-200">
                        {activeMembers.length} / {activeOrganization.limits.maxUsers === 500 ? 'Ilimitado' : activeOrganization.limits.maxUsers}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-violet-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (activeMembers.length / (activeOrganization.limits.maxUsers || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Membros atualmente ativos e associados ao tenant.</p>
                  </Card>

                  {/* Workers meter */}
                  <Card className="p-4 bg-slate-950 border-slate-850 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Workers Habilitados</span>
                      <span className="font-mono text-slate-200">
                        {activeOrganization.workers.length} / {activeOrganization.limits.maxWorkers}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (activeOrganization.workers.length / (activeOrganization.limits.maxWorkers || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Trabalhadores cognitivos autônomos disponíveis.</p>
                  </Card>

                  {/* Workflows meter */}
                  <Card className="p-4 bg-slate-950 border-slate-850 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Workflows Ativos</span>
                      <span className="font-mono text-slate-200">
                        {activeOrganization.workflows.length} / {activeOrganization.limits.maxWorkflows}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (activeOrganization.workflows.length / (activeOrganization.limits.maxWorkflows || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Pipelines de automação corporativos construídos.</p>
                  </Card>
                </div>

                <div className="p-4 bg-violet-600/10 border border-violet-500/15 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-violet-400 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">Precisa expandir os limites de conformidade?</p>
                    <p className="text-slate-400 leading-relaxed">
                      Entre em contato com o seu Administrador de TI ou departamento de faturamento da AgentOps AI para solicitar o upgrade de pacotes ou transitar para a apólice Enterprise com usuários, RAG e Workers infinitos.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
