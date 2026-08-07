'use client';

import React, { useState, useEffect } from 'react';
import { RouteProtection } from '@/components/security/RouteProtection';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Card } from '@/components/ui/Card';
import {
  Key,
  Globe,
  Lock,
  Mail,
  Trash2,
  Check,
  AlertTriangle,
  Copy,
  ToggleLeft,
  ToggleRight,
  Layers,
} from 'lucide-react';
import { OrganizationManager } from '@/organizations/OrganizationManager';
import { OrganizationSSOManager, SingleSignOnConfig } from '@/organizations/OrganizationSSO';
import { OrganizationMFAManager, MultiFactorAuthConfig } from '@/organizations/OrganizationMFA';
import { OrganizationApiKeysManager, EnterpriseApiKey } from '@/organizations/OrganizationApiKeys';
import { OrganizationAuditPoliciesManager } from '@/organizations/OrganizationAuditPolicies';

export default function AuthenticationPage() {
  const [activeOrgId, setActiveOrgId] = useState<string>('');

  // SSO States
  const [ssoConfig, setSsoConfig] = useState<SingleSignOnConfig | null>(null);
  const [samlXml, setSamlXml] = useState('');
  const [oidcUrl, setOidcUrl] = useState('');
  const [oidcClientId, setOidcClientId] = useState('');

  // MFA States
  const [mfaConfig, setMfaConfig] = useState<MultiFactorAuthConfig | null>(null);
  const [mfaMethod, setMfaMethod] = useState<'none' | 'authenticator_app' | 'email_otp'>('none');
  const [mfaEmail, setMfaEmail] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [verifyOtpInput, setVerifyOtpInput] = useState('');

  // API Keys / PATs States
  const [keysList, setKeysList] = useState<EnterpriseApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpires, setNewKeyExpires] = useState(30);
  const [newKeyIsPat, setNewKeyIsPat] = useState(false);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(120);
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read:workers']);
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);

  // Scopes checkbox list
  const availableScopes = [
    { id: 'read:workers', label: 'Ler Workers' },
    { id: 'write:workers', label: 'Modificar Workers' },
    { id: 'read:workflows', label: 'Ler Workflows' },
    { id: 'write:workflows', label: 'Criar/Modificar Workflows' },
    { id: 'read:plugins', label: 'Ler Plugins' },
    { id: 'admin:all', label: 'Acesso Administrador Total' },
  ];

  const loadData = () => {
    try {
      const orgId = OrganizationManager.getInstance().getActiveOrgId();
      setActiveOrgId(orgId);

      // SSO
      const sso = OrganizationSSOManager.getInstance().getConfig(orgId);
      setSsoConfig(sso);

      // MFA (mock logged in user 'user-1')
      const mfa = OrganizationMFAManager.getInstance().getConfig('user-1', orgId);
      setMfaConfig(mfa);
      setMfaMethod(mfa.method);

      // API Keys
      const keys = OrganizationApiKeysManager.getInstance().listKeysByOrg(orgId);
      // seed mock key if list is empty
      if (keys.length === 0) {
        OrganizationApiKeysManager.getInstance().createKey({
          name: 'Default Production CLI',
          userId: 'user-1',
          organizationId: orgId,
          scopes: ['read:workers', 'read:workflows'],
          expiresInDays: 90,
          isPat: false,
        });
        const reloaded = OrganizationApiKeysManager.getInstance().listKeysByOrg(orgId);
        setKeysList(reloaded);
      } else {
        setKeysList(keys);
      }
    } catch (e) {
      console.error('Error loading auth details:', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // SSO actions
  const handleToggleSSO = () => {
    if (!ssoConfig) return;
    const updated = {
      ...ssoConfig,
      enabled: !ssoConfig.enabled,
    };
    OrganizationSSOManager.getInstance().saveConfig(updated);
    setSsoConfig(updated);

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'auth.sso_toggle',
      description: `Alterou ativação de Single Sign-On para ${updated.enabled}`,
      organizationId: activeOrgId,
    });
  };

  const handleToggleRequireSSO = () => {
    if (!ssoConfig) return;
    const updated = {
      ...ssoConfig,
      requireSSO: !ssoConfig.requireSSO,
    };
    OrganizationSSOManager.getInstance().saveConfig(updated);
    setSsoConfig(updated);

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'auth.sso_require_toggle',
      description: `Configurou obrigatoriedade de login via SSO para ${updated.requireSSO}`,
      organizationId: activeOrgId,
    });
  };

  const handleParseSAML = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoConfig || !samlXml.trim()) return;

    try {
      const samlSettings = OrganizationSSOManager.getInstance().parseSAMLMetadata(samlXml);
      const updated: SingleSignOnConfig = {
        ...ssoConfig,
        samlSettings,
        allowedProviders: [...ssoConfig.allowedProviders, 'saml'],
      };
      OrganizationSSOManager.getInstance().saveConfig(updated);
      setSsoConfig(updated);
      setSamlXml('');

      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId: 'user-1',
        userName: 'Admin User',
        action: 'auth.saml_metadata_parse',
        description: `Importou metadados SAML XML da organização. Issuer: ${samlSettings.issuer}`,
        organizationId: activeOrgId,
      });

      alert('Configurações de SAML importadas e validadas com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleOidcDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoConfig || !oidcUrl.trim() || !oidcClientId.trim()) return;

    try {
      const parts = await OrganizationSSOManager.getInstance().discoverOIDC(oidcUrl);
      const updated: SingleSignOnConfig = {
        ...ssoConfig,
        oidcSettings: {
          clientId: oidcClientId,
          discoveryUrl: oidcUrl,
          ...parts,
        },
        allowedProviders: [...ssoConfig.allowedProviders, 'oidc'],
      };
      OrganizationSSOManager.getInstance().saveConfig(updated);
      setSsoConfig(updated);
      setOidcUrl('');
      setOidcClientId('');

      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId: 'user-1',
        userName: 'Admin User',
        action: 'auth.oidc_discover',
        description: `Configurou OpenID Connect (OIDC) via endpoint ${oidcUrl}`,
        organizationId: activeOrgId,
      });

      alert('OpenID Connect (OIDC) configurado com sucesso via Discovery Document!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  // MFA actions
  const handleMfaMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'none' | 'authenticator_app' | 'email_otp';
    setMfaMethod(val);

    if (val === 'none') {
      OrganizationMFAManager.getInstance().disableMFA('user-1', activeOrgId);
      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId: 'user-1',
        userName: 'Admin User',
        action: 'auth.mfa_disable',
        description: 'Desabilitou a autenticação multifator (MFA).',
        organizationId: activeOrgId,
      });
      loadData();
    }
  };

  const handleSetupAuthenticator = () => {
    const details = OrganizationMFAManager.getInstance().initiateAuthenticatorSetup('user-1', activeOrgId);
    setMfaConfig(details);

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'auth.mfa_authenticator_init',
      description: 'Iniciou pareamento de aplicativo autenticador MFA (TOTP).',
      organizationId: activeOrgId,
    });
  };

  const handleTriggerEmailOtp = () => {
    if (!mfaEmail.trim()) {
      alert('Por favor digite um e-mail válido.');
      return;
    }
    const code = OrganizationMFAManager.getInstance().initiateEmailVerification('user-1', activeOrgId, mfaEmail);
    setSentCode(code);
    alert(`Código de verificação enviado para ${mfaEmail}! (Código mock: ${code})`);
  };

  const handleVerifyEmailOtp = () => {
    const success = OrganizationMFAManager.getInstance().verifyEmailOTP('user-1', activeOrgId, verifyOtpInput);
    if (success) {
      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId: 'user-1',
        userName: 'Admin User',
        action: 'auth.mfa_email_enable',
        description: `Habilitou MFA por código de e-mail (${mfaEmail}).`,
        organizationId: activeOrgId,
      });
      setVerifyOtpInput('');
      setMfaEmail('');
      loadData();
      alert('E-mail verificado com sucesso! MFA por e-mail ativada.');
    } else {
      alert('Código de verificação incorreto. Tente novamente.');
    }
  };

  // API Keys actions
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = OrganizationApiKeysManager.getInstance().createKey({
      name: newKeyName.trim(),
      userId: 'user-1',
      organizationId: activeOrgId,
      scopes: newKeyScopes,
      expiresInDays: newKeyExpires,
      isPat: newKeyIsPat,
      rateLimit: newKeyRateLimit,
    });

    setCreatedKeySecret(newKey.key);
    setNewKeyName('');

    OrganizationAuditPoliciesManager.getInstance().logAuthAction({
      userId: 'user-1',
      userName: 'Admin User',
      action: 'auth.api_key_create',
      description: `Gerou nova credencial de acesso corporativo: ${newKeyName} (${newKey.maskedKey})`,
      organizationId: activeOrgId,
    });

    loadData();
  };

  const handleRevokeKey = (id: string, name: string) => {
    if (confirm(`Tem certeza de que deseja revogar definitivamente a chave "${name}"?`)) {
      OrganizationApiKeysManager.getInstance().revokeKey(id);

      OrganizationAuditPoliciesManager.getInstance().logAuthAction({
        userId: 'user-1',
        userName: 'Admin User',
        action: 'auth.api_key_revoke',
        description: `Revogou com sucesso a credencial de acesso ID ${id}`,
        organizationId: activeOrgId,
      });

      loadData();
      alert('Chave revogada com sucesso!');
    }
  };

  const handleToggleScope = (scopeId: string) => {
    if (newKeyScopes.includes(scopeId)) {
      setNewKeyScopes(newKeyScopes.filter((s) => s !== scopeId));
    } else {
      setNewKeyScopes([...newKeyScopes, scopeId]);
    }
  };

  return (
    <RouteProtection>
      <WorkspaceLayout
        activePath="organizations"
        title="Controle de Identidade e Métodos de Login"
        breadcrumbs={[{ label: 'Studio' }, { label: 'Organizações', href: '/organizations' }, { label: 'Autenticação' }]}
      >
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Main Title Banner */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="text-violet-400 h-5 w-5" /> Controle de Identidade & Provedores SSO
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure múltiplos provedores SSO (Google, Microsoft, SAML, OIDC), exija autenticação multifator de seus colaboradores e gere credenciais de API de alta performance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Provedores SSO & MFA */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provedores SSO Card */}
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
                <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="h-4.5 w-4.5 text-violet-400" /> Provedores de Single Sign-On (SSO)
                    </h3>
                    <p className="text-[11px] text-slate-400">Habilite federação de login corporativo para segurança unificada.</p>
                  </div>

                  {/* Toggle switches */}
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>Require SSO:</span>
                      <button onClick={handleToggleRequireSSO} className="text-slate-400 hover:text-white transition cursor-pointer">
                        {ssoConfig?.requireSSO ? (
                          <ToggleRight className="h-6 w-6 text-violet-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-slate-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>SSO Ativo:</span>
                      <button onClick={handleToggleSSO} className="text-slate-400 hover:text-white transition cursor-pointer">
                        {ssoConfig?.enabled ? (
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SSO Provider badges list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex flex-col justify-between items-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Google OAuth</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">Disponível</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex flex-col justify-between items-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GitHub OAuth</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">Disponível</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex flex-col justify-between items-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Azure AD / SAML</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                      ssoConfig?.samlSettings ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-900 border-slate-800'
                    }`}>
                      {ssoConfig?.samlSettings ? 'Configurado' : 'Pendente'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex flex-col justify-between items-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OIDC Connector</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                      ssoConfig?.oidcSettings ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-900 border-slate-800'
                    }`}>
                      {ssoConfig?.oidcSettings ? 'Configurado' : 'Pendente'}
                    </span>
                  </div>
                </div>

                {/* Sub-form SAML configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                  <form onSubmit={handleParseSAML} className="space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Layers className="h-4 w-4 text-violet-400" /> SAML Preparation XML Parser
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Cole o arquivo XML de metadados fornecido por seu Provedor SAML (Azure, Okta etc.) para autoconfiguração.</p>
                    <textarea
                      required
                      placeholder="Cole o XML de metadados contendo <EntityDescriptor ..."
                      value={samlXml}
                      onChange={(e) => setSamlXml(e.target.value)}
                      rows={3}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-violet-500 text-[10px] font-mono"
                    />
                    <button
                      type="submit"
                      className="w-full text-center rounded bg-violet-600 hover:bg-violet-500 py-1.5 text-[11px] font-bold text-white transition cursor-pointer"
                    >
                      Importar XML SAML
                    </button>
                  </form>

                  {/* OpenID Connect settings form */}
                  <form onSubmit={handleOidcDiscovery} className="space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Lock className="h-4 w-4 text-violet-400" /> OpenID Connect (OIDC) Settings
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Especifique a Client ID corporativa e a URL de descoberta pública (ex: https://accounts.google.com).</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Client ID OIDC"
                        value={oidcClientId}
                        onChange={(e) => setOidcClientId(e.target.value)}
                        className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 text-[10px] focus:ring-1"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Discovery Document URL"
                        value={oidcUrl}
                        onChange={(e) => setOidcUrl(e.target.value)}
                        className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 text-[10px] focus:ring-1"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-center rounded border border-slate-700 hover:border-slate-600 bg-slate-950 py-1.5 text-[11px] font-semibold text-slate-300 transition cursor-pointer"
                    >
                      Resolver e Configurar OIDC
                    </button>
                  </form>
                </div>
              </Card>

              {/* Multi-Factor Authentication (MFA) Card */}
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="h-4.5 w-4.5 text-violet-400" /> Autenticação de Dois Fatores (MFA) do Usuário
                  </h3>
                  <p className="text-[11px] text-slate-400">Proteja sua conta individual configurando um segundo fator de validação de acesso.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Método de Login Ativo</label>
                    <select
                      value={mfaMethod}
                      onChange={handleMfaMethodChange}
                      className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="none">Nenhum (Somente Senha)</option>
                      <option value="authenticator_app">App Autenticador (Google / Microsoft Authenticator)</option>
                      <option value="email_otp">Código OTP via E-mail</option>
                    </select>
                  </div>

                  {/* Authenticator display detail */}
                  <div className="sm:col-span-2">
                    {mfaMethod === 'authenticator_app' && (
                      <div className="space-y-4 bg-slate-950 p-4 rounded-lg border border-slate-850">
                        <div className="flex gap-4 items-start">
                          {/* Simulated QR Code representation */}
                          <div className="h-24 w-24 bg-white rounded border flex items-center justify-center font-bold text-black text-center text-[10px] p-2">
                            [QR CODE MOCK]
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                              <Check className="h-4 w-4 text-emerald-500" /> Parear App Autenticador
                            </h5>
                            <p className="text-[10px] text-slate-400">Escaneie o QR Code ou insira a chave secreta manual abaixo para ativar.</p>
                            <p className="text-[10px] font-mono text-violet-400 bg-violet-950/20 p-1.5 rounded inline-block select-all">
                              {mfaConfig?.secret || 'CHAVE_SECRET_PENDENTE'}
                            </p>
                          </div>
                        </div>

                        {/* Generation buttons and recovery codes */}
                        <div className="pt-2 border-t border-slate-900 flex justify-between gap-4">
                          {!mfaConfig?.secret ? (
                            <button
                              type="button"
                              onClick={handleSetupAuthenticator}
                              className="rounded bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                            >
                              Gerar Nova Chave MFA
                            </button>
                          ) : (
                            <div className="w-full space-y-2">
                              <p className="text-[10px] font-bold text-slate-300">Códigos de Recuperação Corporativos (Guarde com cuidado!):</p>
                              <div className="grid grid-cols-2 gap-1.5 text-center font-mono text-[9px]">
                                {mfaConfig.recoveryCodes.map((code) => (
                                  <div key={code} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                    {code}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {mfaMethod === 'email_otp' && (
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-4">
                        <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-violet-400" /> Autenticação por Código de E-mail
                        </h5>
                        <p className="text-[10px] text-slate-400">Um código descartável de 6 dígitos será disparado para seu e-mail a cada tentativa de login.</p>

                        {!mfaConfig?.emailVerified ? (
                          <div className="space-y-3 pt-2">
                            <div className="flex gap-2">
                              <input
                                type="email"
                                placeholder="E-mail de verificação"
                                value={mfaEmail}
                                onChange={(e) => setMfaEmail(e.target.value)}
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 text-[10px] focus:ring-1"
                              />
                              <button
                                type="button"
                                onClick={handleTriggerEmailOtp}
                                className="rounded bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-[10px] font-bold text-white transition cursor-pointer whitespace-nowrap"
                              >
                                Enviar Código
                              </button>
                            </div>

                            {sentCode && (
                              <div className="flex gap-2 animate-in fade-in">
                                <input
                                  type="text"
                                  placeholder="Digite o código (ex: 123456)"
                                  value={verifyOtpInput}
                                  onChange={(e) => setVerifyOtpInput(e.target.value)}
                                  className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 text-[10px] focus:ring-1"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyEmailOtp}
                                  className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white transition cursor-pointer whitespace-nowrap"
                                >
                                  Verificar e Ativar
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> MFA via código de e-mail está habilitado com sucesso.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: API Keys & Personal Access Tokens (PATs) */}
            <div className="space-y-6">
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Key className="h-4.5 w-4.5 text-violet-400" /> Credenciais de API & PATs
                    </h3>
                    <p className="text-[11px] text-slate-400">Gere tokens autenticados para integrações de pipeline, CI/CD e CLI local.</p>
                  </div>

                  {/* Form to create */}
                  <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Nome da Chave</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: API Produção GitHub Bot"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 placeholder-slate-500 text-xs focus:ring-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Validade (Dias)</label>
                        <select
                          value={newKeyExpires}
                          onChange={(e) => setNewKeyExpires(Number(e.target.value))}
                          className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 text-xs focus:ring-1"
                        >
                          <option value={30}>30 Dias</option>
                          <option value={90}>90 Dias</option>
                          <option value={365}>1 Ano</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Rate Limit (Req/Min)</label>
                        <input
                          type="number"
                          value={newKeyRateLimit}
                          onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                          className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100 text-xs focus:ring-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPat"
                        checked={newKeyIsPat}
                        onChange={(e) => setNewKeyIsPat(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="isPat" className="text-xs text-slate-200 font-bold animate-pulse">Gerar como Token de Acesso Pessoal (PAT)</label>
                    </div>

                    {/* Scopes selector */}
                    <div className="space-y-1.5 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Escopos autorizados</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                        {availableScopes.map((sc) => (
                          <label key={sc.id} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                            <input
                              type="checkbox"
                              checked={newKeyScopes.includes(sc.id)}
                              onChange={() => handleToggleScope(sc.id)}
                              className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 h-3 w-3"
                            />
                            <span>{sc.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full text-center rounded bg-violet-600 hover:bg-violet-500 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Gerar Credencial de Acesso
                    </button>
                  </form>
                </div>

                {/* Newly Generated Secret Alert Block (DISPLAY ONCE) */}
                {createdKeySecret && (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-lg text-left space-y-2 animate-in fade-in duration-200">
                    <div className="flex gap-1.5 items-start text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                      <AlertTriangle className="h-4.5 w-4.5 animate-bounce" /> ATENÇÃO: Copie sua chave agora!
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">Esta credencial só será exibida uma vez por motivos óbvios de conformidade e segurança corporativa.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdKeySecret}
                        className="block w-full rounded-lg border border-amber-500/30 bg-slate-950 px-2.5 py-1.5 text-slate-200 font-mono text-[9px] select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdKeySecret);
                          alert('Chave secreta copiada com sucesso para a área de transferência!');
                        }}
                        className="p-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer"
                        title="Copiar Chave Secreta"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* List of active keys */}
              <Card className="p-6 bg-slate-900 border-slate-800 space-y-4 text-left">
                <div className="pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lista de Chaves Ativas</h4>
                  <p className="text-[10px] text-slate-500">Chaves de API registradas que podem acessar este workspace corporativo.</p>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {keysList.map((k) => {
                    const isRevoked = k.status === 'Revoked';
                    const isExpired = k.status === 'Expired';
                    return (
                      <div key={k.id} className="p-3 rounded bg-slate-950 border border-slate-850 flex items-start justify-between gap-3 text-xs leading-none font-sans">
                        <div className="space-y-2 flex-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-100">{k.name}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              isRevoked ? 'text-red-400 bg-red-500/10 border-red-500/20' : isExpired ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            }`}>
                              {k.status}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-violet-400">{k.maskedKey}</p>
                          <div className="flex flex-wrap gap-1 items-center">
                            {k.scopes.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-slate-900 text-[8px] text-slate-500 border border-slate-800 font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {!isRevoked && (
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k.id, k.name)}
                            className="p-1.5 rounded bg-slate-900 hover:bg-red-950 border border-slate-800 text-red-400 hover:text-red-300 transition cursor-pointer"
                            title="Revogar Chave"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    </RouteProtection>
  );
}
