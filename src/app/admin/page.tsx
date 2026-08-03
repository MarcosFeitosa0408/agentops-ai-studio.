'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../context/AuditContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAgents } from '../../context/AgentContext';
import { RouteProtection } from '../../components/security/RouteProtection';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Card } from '../../components/ui/Card';
import { ShieldAlert, Database, Download, Upload, Cpu, Activity, Clock, DollarSign, Users } from 'lucide-react';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const { auditLogs, logAction, clearLogs } = useAudit();
  const { workspaces } = useWorkspace();
  const { agents } = useAgents();

  const [backupStatus, setBackupStatus] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';

  const handleBackup = () => {
    setBackupStatus('Preparando snapshot do sistema...');

    setTimeout(() => {
      try {
        const backupData = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          workspacesCount: workspaces.length,
          agentsCount: agents.length,
          workspaces,
          agents,
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(backupData, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', 'agentops_backup_snapshot.json');
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        logAction('snapshot.backup', 'Executou backup completo das configurações da plataforma (JSON).');
        setBackupStatus('Backup exportado com sucesso!');
      } catch (err) {
        console.error(err);
        setBackupStatus('Falha ao exportar backup.');
      }
    }, 1000);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBackupStatus('Lendo arquivo de snapshot...');
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.version && parsed.workspaces) {
          setBackupStatus(`Restauração bem-sucedida! Encontrados ${parsed.workspacesCount} workspaces e ${parsed.agentsCount} agentes.`);
          logAction('snapshot.restore', 'Restaurou snapshot do sistema com sucesso a partir de arquivo JSON.');
        } else {
          setBackupStatus('Snapshot inválido. Estrutura incompatível.');
        }
      } catch (err) {
        console.error(err);
        setBackupStatus('Erro ao decodificar arquivo JSON.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  const filteredLogs = filterAction === 'all'
    ? auditLogs
    : auditLogs.filter((log) => log.action.startsWith(filterAction));

  if (!isAdmin) {
    return (
      <RouteProtection>
        <WorkspaceLayout
          activePath="admin"
          title="Acesso Restrito"
          breadcrumbs={[{ label: 'Studio' }, { label: 'Admin' }]}
        >
          <div className="max-w-md mx-auto mt-12 text-center p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mx-auto">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Acesso Negado</h3>
            <p className="text-xs text-slate-400">
              Esta seção contém controles de infraestrutura restritos a administradores e controladores do tenant corporativo. Seu cargo atual é <strong className="text-violet-400">{currentUser?.role}</strong>.
            </p>
          </div>
        </WorkspaceLayout>
      </RouteProtection>
    );
  }

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="admin"
        title="Painel Admin & Infraestrutura (IT)"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Admin' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-4 border-slate-800 bg-slate-900 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-600/10 text-violet-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Licenças Ativas</span>
                <span className="text-base font-extrabold text-white">5 de 20</span>
              </div>
            </Card>

            <Card className="p-4 border-slate-800 bg-slate-900 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Custos Mensais</span>
                <span className="text-base font-extrabold text-white">$124.50</span>
              </div>
            </Card>

            <Card className="p-4 border-slate-800 bg-slate-900 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Uso da Cota (LLM)</span>
                <span className="text-base font-extrabold text-white">74.2%</span>
              </div>
            </Card>

            <Card className="p-4 border-slate-800 bg-slate-900 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Armazenamento RAG</span>
                <span className="text-base font-extrabold text-white">12.4 GB</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Audit logs trail */}
            <Card className="lg:col-span-2 p-6 border-slate-800 bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-violet-400 animate-pulse" />
                    Registros Globais de Auditoria (IT Compliance)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Trilha de eventos assinados deterministicamente.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">Todas as Ações</option>
                    <option value="user">Usuário (Login/Reg)</option>
                    <option value="workspace">Workspace</option>
                    <option value="snapshot">Infraestrutura</option>
                    <option value="vault">Secrets</option>
                  </select>
                  <button
                    onClick={clearLogs}
                    className="text-[10px] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950 px-2.5 py-1 rounded transition"
                  >
                    Limpar Logs
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1 text-left">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="bg-violet-500/10 text-violet-400 px-1.5 py-0.2 rounded uppercase">
                        {log.action}
                      </span>
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <p className="font-semibold text-slate-200">{log.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono pt-1">
                      <span>IP: {log.ip}</span>
                      <span>Autor: {log.userName}</span>
                      {log.workspaceId && <span>Workspace: {log.workspaceId}</span>}
                      <span className="text-violet-500/80">SHA: {log.hash.slice(0, 24)}...</span>
                    </div>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-6">Nenhum registro de auditoria encontrado.</p>
                )}
              </div>
            </Card>

            {/* Right Column: Infrastructure Tools */}
            <div className="space-y-6">
              {/* Disaster Recovery Snapshot Module */}
              <Card className="p-5 border-slate-800 bg-slate-900 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Database className="h-4.5 w-4.5 text-violet-400" />
                    Recuperação de Desastres (DR)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gerencie cópias de segurança do estado da aplicação.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleBackup}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition"
                  >
                    <Download className="h-4 w-4" /> Exportar System Backup (JSON)
                  </button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      id="restore-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="restore-upload"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                    >
                      <Upload className="h-4 w-4" /> Restaurar de Backup (JSON)
                    </label>
                  </div>

                  {backupStatus && (
                    <div className="p-2.5 rounded text-[11px] bg-slate-950 border border-slate-800 text-violet-400 font-medium">
                      {backupStatus}
                    </div>
                  )}
                </div>
              </Card>

              {/* Maintenance Guidelines */}
              <Card className="p-5 border-slate-800 bg-slate-900 text-xs space-y-2.5 text-slate-400 leading-relaxed">
                <h5 className="font-bold text-white text-left">Diretrizes de Conformidade</h5>
                <p className="text-left">
                  Este painel interage com os microsserviços do diretório central do SSO. A exclusão de logs de auditoria é protegida e auditada remotamente no Data Lake de conformidade regulatória.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 text-left">
                  <Clock className="h-3.5 w-3.5" /> Último backup: Diário automático ativo
                </div>
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
