'use client';

import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../context/AuditContext';
import { RouteProtection } from '../../components/security/RouteProtection';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Card } from '../../components/ui/Card';
import { Folder, Plus, CheckCircle, Users, Sparkles } from 'lucide-react';
import { MOCK_USERS } from '../../lib/auth/authService';

export default function WorkspacesPage() {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, addMemberToWorkspace } = useWorkspace();
  const { currentUser } = useAuth();
  const { logAction } = useAudit();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newWs = createWorkspace(name, description, department);
    logAction(
      'workspace.create',
      `Criou o workspace "${name}" sob a diretoria de ${department}.`,
      newWs.id,
    );
    setName('');
    setDescription('');
    setShowCreateForm(false);
  };

  const handleSwitch = (id: string, wsName: string) => {
    switchWorkspace(id);
    logAction(
      'workspace.switch',
      `Alternou com sucesso de sessão para o workspace "${wsName}".`,
      id,
    );
  };

  const handleAddMember = (wsId: string, userId: string, userName: string) => {
    addMemberToWorkspace(wsId, userId);
    logAction(
      'workspace.invite',
      `Adicionou/associou o usuário corporativo "${userName}" ao workspace.`,
      wsId,
    );
  };

  const userHasAccess = (wsMembers: string[]) => {
    return currentUser ? wsMembers.includes(currentUser.id) : false;
  };

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="workspaces"
        title="Gerenciador de Workspaces Enterprise"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Workspaces' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Main Workspace List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Seus Workspaces Disponíveis</h3>
                  <p className="text-xs text-slate-400">Ambientes isolados e restritos ao seu perfil SSO.</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition"
                >
                  <Plus className="h-4 w-4" /> Novo Workspace
                </button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <Card className="p-5 border-slate-800 bg-slate-900/80 backdrop-blur-md">
                  <form onSubmit={handleCreate} className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-violet-400" /> Criar Novo Workspace Isolado
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Nome do Workspace</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Marketing Latam"
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Diretoria / Departamento</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                        >
                          <option value="Finance">Finance / Finanças</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Engineering">Engineering / Engenharia</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Descrição Comercial / Conformidade</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva as diretrizes de acesso e objetivos deste workspace..."
                        className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm h-20"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="rounded px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white transition"
                      >
                        Salvar e Ativar
                      </button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Grid of existing workspaces */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspaces.map((ws) => {
                  const isActive = activeWorkspace?.id === ws.id;
                  const hasAccess = userHasAccess(ws.members);

                  return (
                    <Card
                      key={ws.id}
                      className={`p-5 text-left border-slate-800 bg-slate-900 transition flex flex-col justify-between ${
                        isActive ? 'ring-2 ring-violet-500/80 border-transparent bg-slate-900/90' : 'hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/15">
                            {ws.department}
                          </span>
                          {isActive && (
                            <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Ativo
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Folder className="h-4.5 w-4.5 text-slate-400" /> {ws.name}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {ws.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedWsId(ws.id)}
                          className="text-[11px] font-bold text-slate-400 hover:text-white inline-flex items-center gap-1"
                        >
                          <Users className="h-3.5 w-3.5" />
                          {ws.members.length} membros
                        </button>

                        {hasAccess ? (
                          <button
                            onClick={() => handleSwitch(ws.id, ws.name)}
                            disabled={isActive}
                            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                              isActive
                                ? 'bg-slate-950 text-slate-500 cursor-not-allowed border border-slate-800'
                                : 'bg-violet-600 hover:bg-violet-500 text-white'
                            }`}
                          >
                            {isActive ? 'Ativo' : 'Alternar'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-red-400/80 font-semibold bg-red-500/5 px-2 py-1 rounded">
                            Sem acesso SSO
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Column: Membership Details */}
            <div className="lg:col-span-1">
              <Card className="p-5 border-slate-800 bg-slate-900 space-y-4 h-full">
                <div className="pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Users className="h-4.5 w-4.5 text-violet-400" /> Membros do Workspace
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Associe novos membros corporativos.</p>
                </div>

                {selectedWsId ? (
                  (() => {
                    const ws = workspaces.find((w) => w.id === selectedWsId);
                    if (!ws) return <p className="text-xs text-slate-500">Selecione um workspace.</p>;

                    return (
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-violet-400">{ws.name}</p>

                        <div className="space-y-2">
                          {MOCK_USERS.map((user) => {
                            const isMember = ws.members.includes(user.id);

                            return (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
                                </div>

                                {isMember ? (
                                  <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                    Membro
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleAddMember(ws.id, user.id, user.name)}
                                    className="text-[10px] font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded hover:bg-violet-600/20 transition"
                                  >
                                    Adicionar
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-10 select-none">
                    <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Selecione um workspace</p>
                    <p className="text-[10px] text-slate-500 mt-1">Clique em &quot;membros&quot; em qualquer card ao lado para ver e adicionar usuários.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
