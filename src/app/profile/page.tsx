'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../context/AuditContext';
import { RouteProtection } from '../../components/security/RouteProtection';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Card } from '../../components/ui/Card';
import { Shield, RefreshCw, Key, ShieldCheck, Clock } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, sessionToken, refreshSession } = useAuth();
  const { logAction, auditLogs } = useAudit();
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState('4 horas (JWT Active)');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSession();
    logAction('session.refresh', 'Acionamento manual da rota de rotação de chaves JWT da sessão.');
    setRefreshing(false);
    setCountdown('4 horas (JWT Refreshed)');
  };

  const userLogs = auditLogs.filter((log) => log.userId === currentUser?.id);

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="profile"
        title="Perfil & Segurança Corporativa"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Perfil' }]}
      >
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          {/* Header Banner */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-tr from-violet-950/20 via-slate-900 to-slate-900 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 text-xl font-extrabold text-violet-400 border border-violet-500/20 shadow-inner">
                {currentUser?.avatar}
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
                <p className="text-xs text-slate-400">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-400 border border-violet-500/10">
                  <Shield className="h-3 w-3" />
                  Cargo: {currentUser?.role}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Management */}
            <Card className="p-5 border-slate-800 bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Key className="h-5 w-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Segurança da Sessão (JWT)</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Token JWT Atual</span>
                  <div className="mt-1 rounded-lg bg-slate-950 p-2.5 font-mono text-[10px] text-violet-300 break-all select-all border border-slate-800">
                    {sessionToken || 'Nenhum token ativo'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Expiração / Rotação</span>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      Em {countdown}
                    </span>
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1 rounded bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                    Simular JWT Refresh
                  </button>
                </div>
              </div>
            </Card>

            {/* Compliance Stats */}
            <Card className="p-5 border-slate-800 bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <ShieldCheck className="h-5 w-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Auditoria e Conformidade</h3>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-medium block">ID do Usuário</span>
                    <span className="font-mono text-xs text-white block mt-0.5">{currentUser?.id}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-medium block">IP de Conexão</span>
                    <span className="text-xs text-white font-semibold block mt-0.5">127.0.0.1 (VPN Local)</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium block">Nível de Acesso (RBAC)</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Permissões corporativas de acordo com as diretrizes de governança da empresa para a função <strong className="text-white">{currentUser?.role}</strong>.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Audit Logs Trail */}
          <Card className="p-5 border-slate-800 bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Shield className="h-5 w-5 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Sua Linha de Atividade Recente (Audit Trail)</h3>
            </div>

            <div className="flow-root">
              <ul className="-mb-8">
                {userLogs.slice(0, 5).map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== userLogs.slice(0, 5).length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center ring-4 ring-slate-900 text-xs font-bold">
                            {log.action.split('.')[1]?.slice(0, 2).toUpperCase() || 'AU'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs font-bold text-white">
                            {log.action}{' '}
                            <span className="font-normal text-slate-400">— {log.description}</span>
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-3">
                            <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            <span className="text-violet-500">Hash: {log.hash.slice(0, 16)}...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
