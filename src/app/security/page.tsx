'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../context/AuditContext';
import { RouteProtection } from '../../components/security/RouteProtection';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Card } from '../../components/ui/Card';
import { Shield, Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { ROLE_PERMISSIONS } from '../../lib/rbac/rbacService';
import { UserRole } from '../../lib/auth/types';
import { Permission } from '../../lib/rbac/types';

const ALL_PERMISSIONS: { name: Permission; label: string }[] = [
  { name: 'create:agents', label: 'Create Agents' },
  { name: 'edit:agents', label: 'Edit Agents' },
  { name: 'delete:agents', label: 'Delete Agents' },
  { name: 'execute:agents', label: 'Execute Agents' },
  { name: 'manage:providers', label: 'Manage Providers' },
  { name: 'run:python', label: 'Run Python' },
  { name: 'run:sql', label: 'Run SQL' },
];

const ROLES_LIST: UserRole[] = [
  'Super Admin',
  'Admin',
  'Manager',
  'AI Developer',
  'Data Analyst',
  'Viewer',
];

export default function SecurityPage() {
  const { currentUser } = useAuth();
  const { logAction } = useAudit();

  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const toggleKeyReveal = (provider: string) => {
    setRevealedKeys((prev) => {
      const isRevealing = !prev[provider];
      if (isRevealing) {
        logAction('vault.reveal', `Visualizou chave de API mascarada para o provedor ${provider}.`);
      }
      return { ...prev, [provider]: isRevealing };
    });
  };

  const getMaskedKey = (provider: string, secret: string) => {
    if (revealedKeys[provider]) {
      return secret;
    }
    return 'sk-proj-••••••••••••••••••••' + secret.slice(-4);
  };

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="security"
        title="Controle de Acesso & Governança (RBAC)"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Segurança' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Header Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
                <Shield className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Matriz de Alçadas & Governança Enterprise</h3>
                <p className="text-xs text-slate-400">
                  Configure as permissões dos usuários do tenant. O controle de acesso baseado em funções (RBAC) garante conformidade com as regras de conformidade corporativa e proteção contra vazamento de credenciais.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* RBAC Table Matrix - Spans 3 columns */}
            <Card className="lg:col-span-3 p-6 border-slate-800 bg-slate-900 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Matriz de Permissões</h4>
                <p className="text-xs text-slate-400">Mapeamento visual entre funções corporativas e permissões do sistema.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-800">Ação / Recurso</th>
                      {ROLES_LIST.map((role) => (
                        <th
                          key={role}
                          className={`px-3 py-3 text-center border-b border-slate-800 ${
                            currentUser?.role === role ? 'text-violet-400 font-extrabold bg-violet-500/5' : ''
                          }`}
                        >
                          {role.replace(' ', '\n')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ALL_PERMISSIONS.map((perm) => (
                      <tr key={perm.name} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3.5 font-semibold text-slate-200">{perm.label}</td>
                        {ROLES_LIST.map((role) => {
                          const hasPerm = ROLE_PERMISSIONS[role].includes(perm.name);
                          return (
                            <td
                              key={role}
                              className={`px-3 py-3.5 text-center ${
                                currentUser?.role === role ? 'bg-violet-500/5' : ''
                              }`}
                            >
                              <div className="flex justify-center">
                                {hasPerm ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500/80" />
                                ) : (
                                  <XCircle className="h-4.5 w-4.5 text-rose-500/50" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Side Column: Vault / Keys & Session Monitor */}
            <div className="space-y-6 lg:col-span-1">
              {/* Session State */}
              <Card className="p-5 border-slate-800 bg-slate-900 space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Minha Auditoria de Sessão</span>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Sua Função Atual:</span>
                    <span className="inline-block mt-1 bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded text-xs font-bold border border-violet-500/10">
                      {currentUser?.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Próxima Redefinição:</span>
                    <span className="text-xs text-slate-200 font-semibold block mt-1 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-slate-500" />
                      Em 4 horas (JWT Refresh)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400 block">Conformidade e IP:</span>
                    <span className="text-[10px] text-amber-400 font-mono block mt-1 flex items-center gap-1.5">
                      <Shield className="h-3 w-3" /> IP: 127.0.0.1 (VPN Local)
                    </span>
                  </div>
                </div>
              </Card>

              {/* Secure API Key Vault */}
              <Card className="p-5 border-slate-800 bg-slate-900 space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Criptografia de Chaves</span>
                  <div className="mt-2 flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-xs text-slate-300">
                    <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Vault Mock Ativo</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Chaves salvas com hash AES-256</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2.5 leading-normal">
                    Todas as chaves configuradas em &quot;AI Core&quot; são mascaradas e protegidas localmente no seu navegador.
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">OpenAI Api Key</span>
                    <div className="flex items-center gap-2 rounded bg-slate-950 p-2 border border-slate-800">
                      <span className="font-mono text-[10px] text-slate-400 truncate flex-1">
                        {getMaskedKey('openai', 'sk-proj-7a2b9c3c1d0e5f9a8b7c6d5e4f3a2b1')}
                      </span>
                      <button
                        onClick={() => toggleKeyReveal('openai')}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {revealedKeys['openai'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">Anthropic Api Key</span>
                    <div className="flex items-center gap-2 rounded bg-slate-950 p-2 border border-slate-800">
                      <span className="font-mono text-[10px] text-slate-400 truncate flex-1">
                        {getMaskedKey('anthropic', 'sk-proj-e1a2f3f5d8e7a2b9c3c1d0e5f9a8b7c')}
                      </span>
                      <button
                        onClick={() => toggleKeyReveal('anthropic')}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {revealedKeys['anthropic'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
