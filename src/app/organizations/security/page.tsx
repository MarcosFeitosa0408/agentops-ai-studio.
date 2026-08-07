'use client';

import React, { useState, useEffect } from 'react';
import { RouteProtection } from '@/components/security/RouteProtection';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Card } from '@/components/ui/Card';
import {
  Shield,
  Lock,
  Globe,
  LogOut,
  Plus,
  Trash2,
  FileText,
  Laptop,
  CheckCircle,
} from 'lucide-react';
import { OrganizationManager } from '@/organizations/OrganizationManager';
import { OrganizationSessionsManager, ActiveSession } from '@/organizations/OrganizationSessions';
import { OrganizationAuditPoliciesManager, SecurityPolicies } from '@/organizations/OrganizationAuditPolicies';
import { AuditLogEntry } from '@/lib/audit/types';

export default function SecurityPage() {
  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [policies, setPolicies] = useState<SecurityPolicies | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Input states
  const [newIp, setNewIp] = useState('');
  const [newDomain, setNewDomain] = useState('');

  // Password policy inputs
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);

  // Timeouts
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [trustedNetworksOnly, setTrustedNetworksOnly] = useState(false);

  // Load and refresh data
  const loadData = () => {
    try {
      const orgId = OrganizationManager.getInstance().getActiveOrgId();
      setActiveOrgId(orgId);

      const pol = OrganizationAuditPoliciesManager.getInstance().getPolicies(orgId);
      setPolicies(pol);
      setMinLength(pol.passwordPolicy.minLength);
      setRequireUppercase(pol.passwordPolicy.requireUppercase);
      setRequireLowercase(pol.passwordPolicy.requireLowercase);
      setRequireNumbers(pol.passwordPolicy.requireNumbers);
      setRequireSpecialChars(pol.passwordPolicy.requireSpecialCharacters);
      setSessionTimeout(pol.sessionTimeoutMinutes);
      setTrustedNetworksOnly(pol.trustedNetworksOnly);

      const sess = OrganizationSessionsManager.getInstance().listSessionsByOrg(orgId);
      // If there are no mock sessions, generate one default active session for display purposes
      if (sess.length === 0) {
        OrganizationSessionsManager.getInstance().createSession({
          userId: 'user-1',
          organizationId: orgId,
          ipAddress: '192.168.1.105',
          userAgent: 'Chrome on MacOS (Desktop)',
          deviceType: 'Desktop',
        });
        OrganizationSessionsManager.getInstance().createSession({
          userId: 'user-2',
          organizationId: orgId,
          ipAddress: '189.45.12.98',
          userAgent: 'Safari on iPhone (Mobile)',
          deviceType: 'Mobile',
        });
        const reloaded = OrganizationSessionsManager.getInstance().listSessionsByOrg(orgId);
        setSessions(reloaded);
      } else {
        setSessions(sess);
      }

      const logs = OrganizationAuditPoliciesManager.getInstance().getLocalLogs(orgId);
      if (logs.length === 0) {
        // seed mock log
        OrganizationAuditPoliciesManager.getInstance().logAuthAction({
          userId: 'user-1',
          userName: 'Admin User',
          action: 'security.policy_init',
          description: 'Inicializou as políticas de segurança padrão do tenant.',
          organizationId: orgId,
        });
        const seededLogs = OrganizationAuditPoliciesManager.getInstance().getLocalLogs(orgId);
        setAuditLogs(seededLogs);
      } else {
        setAuditLogs(logs);
      }
    } catch (e) {
      console.error('Error loading security details:', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !policies) return;

    const updated: SecurityPolicies = {
      ...policies,
      passwordPolicy: {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialCharacters: requireSpecialChars,
      },
      sessionTimeoutMinutes: sessionTimeout,
      trustedNetworksOnly,
    };

    OrganizationAuditPoliciesManager.getInstance().savePolicies(updated);
    setPolicies(updated);

    // Audit log
    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'security.policy_update',
      description: `Atualizou as diretivas de senha e timeout da organização. (Min ${minLength} car.)`,
      organizationId: activeOrgId,
    });

    loadData();
    alert('Políticas de segurança salvas com sucesso!');
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim() || !activeOrgId || !policies) return;

    const updatedList = [...policies.ipAllowList, newIp.trim()];
    const updated: SecurityPolicies = {
      ...policies,
      ipAllowList: updatedList,
    };

    OrganizationAuditPoliciesManager.getInstance().savePolicies(updated);
    setPolicies(updated);
    setNewIp('');

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'security.ip_whitelist_add',
      description: `Adicionou o IP/Máscara ${newIp.trim()} à whitelist.`,
      organizationId: activeOrgId,
    });

    loadData();
  };

  const handleRemoveIp = (ipToRemove: string) => {
    if (!activeOrgId || !policies) return;

    const updatedList = policies.ipAllowList.filter((ip) => ip !== ipToRemove);
    const updated: SecurityPolicies = {
      ...policies,
      ipAllowList: updatedList,
    };

    OrganizationAuditPoliciesManager.getInstance().savePolicies(updated);
    setPolicies(updated);

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'security.ip_whitelist_remove',
      description: `Removeu o IP/Máscara ${ipToRemove} da whitelist.`,
      organizationId: activeOrgId,
    });

    loadData();
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !activeOrgId || !policies) return;

    const updatedList = [...policies.domainRestrictions, newDomain.trim().toLowerCase()];
    const updated: SecurityPolicies = {
      ...policies,
      domainRestrictions: updatedList,
    };

    OrganizationAuditPoliciesManager.getInstance().savePolicies(updated);
    setPolicies(updated);
    setNewDomain('');

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'security.domain_restriction_add',
      description: `Adicionou o domínio restrito @${newDomain.trim()} à organização.`,
      organizationId: activeOrgId,
    });

    loadData();
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    if (!activeOrgId || !policies) return;

    const updatedList = policies.domainRestrictions.filter((d) => d !== domainToRemove);
    const updated: SecurityPolicies = {
      ...policies,
      domainRestrictions: updatedList,
    };

    OrganizationAuditPoliciesManager.getInstance().savePolicies(updated);
    setPolicies(updated);

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'security.domain_restriction_remove',
      description: `Removeu a restrição de domínio @${domainToRemove}.`,
      organizationId: activeOrgId,
    });

    loadData();
  };

  const handleForcedLogout = (sessionId: string) => {
    if (confirm('Deseja realmente derrubar esta sessão de usuário (Forced Logout)?')) {
      OrganizationSessionsManager.getInstance().revokeSession(sessionId);

      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId: 'user-1',
        userName: 'Admin User',
        action: 'security.session_revoke',
        description: `Derrubou a sessão de ID ${sessionId} forçadamente.`,
        organizationId: activeOrgId,
      });

      loadData();
      alert('Sessão revogada com sucesso!');
    }
  };

  const handleToggleTrust = (sessionId: string, currentTrust: boolean) => {
    OrganizationSessionsManager.getInstance().toggleTrustDevice(sessionId, !currentTrust);

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'security.device_trust_toggle',
      description: `Alterou confiabilidade do dispositivo da sessão ${sessionId} para ${!currentTrust}.`,
      organizationId: activeOrgId,
    });

    loadData();
  };

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="organizations"
        title="Controle de Segurança e Políticas de Acesso"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Organizações', href: '/organizations' }, { label: 'Segurança' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Main Title Description */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="text-violet-400 h-5 w-5" /> Centro de Segurança Enterprise
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie políticas estritas de acesso corporativo, regras de senha, whitelists de IP, controle de sessões ativas e histórico de auditoria de conformidade.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Password Policies & Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form Card */}
              <Card className="p-6 bg-slate-900 border-slate-800">
                <form onSubmit={handleSavePolicies} className="space-y-6">
                  <div className="pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="h-4.5 w-4.5 text-violet-400" /> Diretivas de Complexidade de Senhas
                    </h3>
                    <p className="text-[11px] text-slate-400">Exija complexidade robusta no login manual de usuários para evitar brechas.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Comprimento Mínimo</label>
                      <input
                        type="number"
                        min={6}
                        max={32}
                        value={minLength}
                        onChange={(e) => setMinLength(Number(e.target.value))}
                        className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Tempo Limite de Sessão (Ociosa)</label>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(Number(e.target.value))}
                        className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-violet-500"
                      >
                        <option value={15}>15 Minutos</option>
                        <option value={30}>30 Minutos</option>
                        <option value={60}>1 Hora</option>
                        <option value={120}>2 Horas</option>
                        <option value={480}>8 Horas</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="upper"
                        checked={requireUppercase}
                        onChange={(e) => setRequireUppercase(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="upper" className="text-xs text-slate-200">Requerer Letras Maiúsculas (A-Z)</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="lower"
                        checked={requireLowercase}
                        onChange={(e) => setRequireLowercase(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="lower" className="text-xs text-slate-200">Requerer Letras Minúsculas (a-z)</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="number"
                        checked={requireNumbers}
                        onChange={(e) => setRequireNumbers(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="number" className="text-xs text-slate-200">Requerer Números (0-9)</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="spec"
                        checked={requireSpecialChars}
                        onChange={(e) => setRequireSpecialChars(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="spec" className="text-xs text-slate-200">Requerer Caracteres Especiais (!@#$%^&* etc.)</label>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                      <input
                        type="checkbox"
                        id="trustedOnly"
                        checked={trustedNetworksOnly}
                        onChange={(e) => setTrustedNetworksOnly(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="trustedOnly" className="text-xs text-slate-200 font-bold">Bloquear logins fora de redes confiáveis (Trusted Networks Only)</label>
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

              {/* Active Sessions Manager */}
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Laptop className="h-4.5 w-4.5 text-violet-400" /> Gerenciamento de Sessões Ativas e Dispositivos
                  </h3>
                  <p className="text-[11px] text-slate-400">Sessões corporativas autenticadas atualmente neste Tenant.</p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                  <table className="min-w-full divide-y divide-slate-800 text-xs">
                    <thead className="bg-slate-900 text-slate-400 text-left font-bold">
                      <tr>
                        <th className="px-4 py-3">Dispositivo / User-Agent</th>
                        <th className="px-4 py-3">IP Address</th>
                        <th className="px-4 py-3">Confiável</th>
                        <th className="px-4 py-3">Vencimento</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {sessions.map((sess) => (
                        <tr key={sess.id} className="hover:bg-slate-900/50">
                          <td className="px-4 py-3 font-sans text-left">
                            <p className="font-bold text-slate-200">{sess.deviceType}</p>
                            <p className="text-[9px] text-slate-500">{sess.userAgent}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{sess.ipAddress}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleTrust(sess.id, sess.trusted)}
                              className={`text-[9px] px-2 py-0.5 rounded border font-bold ${
                                sess.trusted
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                                  : 'text-slate-500 bg-slate-900 border-slate-800'
                              }`}
                            >
                              {sess.trusted ? 'Trusted' : 'Untrusted'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-slate-500">
                            {new Date(sess.expiresAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleForcedLogout(sess.id)}
                              title="Derrubar Sessão"
                              className="p-1 rounded bg-slate-900 hover:bg-red-950 text-red-400 hover:text-red-300 transition cursor-pointer border border-slate-800"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Right Column: IP Whitelist & Restricted Domains */}
            <div className="space-y-6">
              {/* IP Whitelist Card */}
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Globe className="h-4.5 w-4.5 text-violet-400" /> IP Allow List
                  </h3>
                  <p className="text-[11px] text-slate-400">Permita conexões somente de redes empresariais ou VPNs especificadas.</p>
                </div>

                <form onSubmit={handleAddIp} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 192.168.1.* ou 200.54.12.85"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-violet-500 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                  {policies?.ipAllowList.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 font-mono text-xs">
                      <span className="text-slate-300">{ip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIp(ip)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {policies?.ipAllowList.length === 0 && (
                    <p className="text-[11px] text-slate-500 text-center py-4">Sem restrições de IP de acesso. Aberto para qualquer rede.</p>
                  )}
                </div>
              </Card>

              {/* Domain restrictions */}
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-violet-400" /> Restrições de Domínio de E-mail
                  </h3>
                  <p className="text-[11px] text-slate-400">Impeça a admissão de contas de e-mail de domínios públicos (ex: gmail.com).</p>
                </div>

                <form onSubmit={handleAddDomain} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: minhaempresa.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-violet-500 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                  {policies?.domainRestrictions.map((domain) => (
                    <div key={domain} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 font-mono text-xs">
                      <span className="text-slate-300">@{domain}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {policies?.domainRestrictions.length === 0 && (
                    <p className="text-[11px] text-slate-500 text-center py-4">Sem restrições de domínios. Todos os provedores são permitidos.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Compliance Audit Logs */}
          <Card className="p-6 bg-slate-900 border-slate-800 text-left space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-violet-400" /> Registros e Eventos de Auditoria Local
              </h3>
              <p className="text-[11px] text-slate-400">Trilha de eventos de autenticação e modificações de segurança auditadas sob hash de conformidade SHA-256.</p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-4 py-3">Código de Evento / Hash</th>
                    <th className="px-4 py-3">Operador</th>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Descrição Detalhada</th>
                    <th className="px-4 py-3">Data e Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 text-left">
                        <p className="font-bold text-slate-200">{log.id}</p>
                        <p className="text-[9px] text-slate-500 font-mono text-ellipsis overflow-hidden max-w-xs">{log.hash}</p>
                      </td>
                      <td className="px-4 py-3 font-sans text-left">
                        <p className="font-bold text-slate-200">{log.userName}</p>
                        <p className="text-[9px] text-slate-500">{log.userId}</p>
                      </td>
                      <td className="px-4 py-3 text-violet-400 text-left">{log.action}</td>
                      <td className="px-4 py-3 text-slate-400 font-sans text-left">{log.description}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}

                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-500">
                        Nenhum evento registrado nesta auditoria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
