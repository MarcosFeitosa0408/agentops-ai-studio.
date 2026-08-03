'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Boxes,
  Search,
  Settings,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Power,
  Key,
  Lock,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { PluginRegistry, RegisteredPlugin } from '@/lib/mcp/registry/PluginRegistry';
import { SecretManager } from '@/lib/mcp/SecretManager';
import { ConnectorManager } from '@/lib/mcp/ConnectorManager';

export default function PluginsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plugins, setPlugins] = useState<RegisteredPlugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [configuringPlugin, setConfiguringPlugin] = useState<RegisteredPlugin | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const registry = useMemo(() => PluginRegistry.getInstance(), []);
  const secretManager = useMemo(() => SecretManager.getInstance(), []);
  const connectorManager = useMemo(() => ConnectorManager.getInstance(), []);

  const loadPlugins = useCallback(() => {
    registry.discoverPlugins();
    setPlugins(registry.list());
  }, [registry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlugins();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPlugins]);

  const handleToggleEnable = async (plugin: RegisteredPlugin) => {
    const success = plugin.enabled
      ? registry.disablePlugin(plugin.manifest.id)
      : registry.enablePlugin(plugin.manifest.id);

    if (success) {
      if (plugin.enabled) {
        await connectorManager.disconnectConnector(plugin.manifest.id);
      }
      loadPlugins();
      toast(
        plugin.enabled ? 'Plugin Desabilitado' : 'Plugin Ativado',
        `O plugin ${plugin.manifest.name} foi ${plugin.enabled ? 'desativado' : 'ativado'} com sucesso.`,
        'success'
      );
    }
  };

  const handleUninstall = async (plugin: RegisteredPlugin) => {
    const success = registry.removePlugin(plugin.manifest.id);
    if (success) {
      await connectorManager.disconnectConnector(plugin.manifest.id);
      secretManager.clearPluginSecrets(plugin.manifest.id);
      loadPlugins();
      toast(
        'Plugin Removido',
        `O plugin ${plugin.manifest.name} foi removido do seu workspace.`,
        'success'
      );
    }
  };

  const handleInstall = (plugin: RegisteredPlugin) => {
    plugin.installed = true;
    plugin.enabled = true;
    registry.enablePlugin(plugin.manifest.id);
    loadPlugins();
    toast(
      'Plugin Instalado',
      `O plugin ${plugin.manifest.name} foi instalado com sucesso.`,
      'success'
    );
  };

  const handleUpdate = (plugin: RegisteredPlugin) => {
    toast(
      'Plugin Atualizado',
      `O plugin ${plugin.manifest.name} está atualizado na versão mais recente (${plugin.manifest.version}).`,
      'success'
    );
  };

  const handleOpenConfigure = (plugin: RegisteredPlugin) => {
    setConfiguringPlugin(plugin);
    // Load existing credentials decrypted
    const saved = secretManager.getPluginSecrets(plugin.manifest.id);

    // Default configs depending on ID
    const initialConfig: Record<string, string> = { ...saved };
    if (plugin.manifest.id === 'github-connector' && !initialConfig['github_token']) {
      initialConfig['github_token'] = '';
    } else if (plugin.manifest.id === 'slack-connector' && !initialConfig['slack_bot_token']) {
      initialConfig['slack_bot_token'] = '';
    } else if (plugin.manifest.id === 'gmail-connector' && !initialConfig['gmail_oauth_token']) {
      initialConfig['gmail_oauth_token'] = '';
    } else if (plugin.manifest.id === 'notion-connector' && !initialConfig['notion_api_key']) {
      initialConfig['notion_api_key'] = '';
    } else if (plugin.manifest.id === 'google-drive-connector' && !initialConfig['gdrive_oauth_token']) {
      initialConfig['gdrive_oauth_token'] = '';
    } else if (plugin.manifest.id === 'postgresql-connector' && !initialConfig['pg_connection_string']) {
      initialConfig['pg_connection_string'] = '';
    } else if (plugin.manifest.id === 'mysql-connector' && !initialConfig['mysql_connection_string']) {
      initialConfig['mysql_connection_string'] = '';
    } else if (plugin.manifest.id === 'filesystem-connector' && !initialConfig['filesystem_root_path']) {
      initialConfig['filesystem_root_path'] = '';
    }

    setConfigValues(initialConfig);
  };

  const handleSaveConfig = () => {
    if (!configuringPlugin) return;

    for (const [key, val] of Object.entries(configValues)) {
      secretManager.storeSecret(configuringPlugin.manifest.id, key, val);
    }

    setConfiguringPlugin(null);
    toast(
      'Configurações Salvas',
      `As credenciais do plugin ${configuringPlugin.manifest.name} foram criptografadas e salvas no Secret Manager.`,
      'success'
    );
    loadPlugins();
  };

  // Categories list
  const categories = ['All', 'DevOps', 'Collaboration', 'Database', 'File System'];

  const filteredPlugins = plugins.filter((p) => {
    const matchesSearch =
      p.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manifest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.manifest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-neutral-light/30 text-text-primary transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem="Plugins" />

      <div className="flex flex-1 flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Container className="py-6 sm:py-8">
            <Section>
              {/* Header */}
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plugin Marketplace</h1>
                  </div>
                  <p className="text-text-muted mt-1 text-sm sm:text-base">
                    Discover, manage, and configure secure integrations powered by Model Context Protocol (MCP).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 border-primary/20 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-primary">
                    <Shield className="h-3.5 w-3.5" />
                    AES-256 Vault Active
                  </div>
                  <Button variant="ghost" size="sm" onClick={loadPlugins} className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="text-text-muted absolute top-3 left-3 h-4 w-4" />
                  <Input
                    placeholder="Search plugins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 border ${
                        selectedCategory === cat
                          ? 'bg-primary border-primary text-white shadow-xs'
                          : 'bg-surface border-border text-text-secondary hover:bg-neutral-light'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPlugins.map((p) => {
                  const hasSecrets = Object.keys(secretManager.getPluginSecrets(p.manifest.id)).length > 0;

                  return (
                    <Card
                      key={p.manifest.id}
                      className={`relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                        !p.installed
                          ? 'opacity-70 bg-surface/50 border-border/60'
                          : p.enabled
                          ? 'border-border bg-surface'
                          : 'border-border/40 bg-neutral-light/10'
                      }`}
                    >
                      {/* Top content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="from-primary/10 to-accent/10 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr text-primary border border-primary/10">
                              <Boxes className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-base font-bold text-text-primary leading-tight">
                                {p.manifest.name}
                              </h3>
                              <span className="text-text-muted text-[11px] font-medium block">
                                by {p.manifest.author}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <Badge variant={p.enabled && p.installed ? 'success' : 'secondary'}>
                              {p.installed ? (p.enabled ? 'Active' : 'Disabled') : 'Available'}
                            </Badge>
                            {p.deprecated && (
                              <Badge variant="danger" className="text-[9px] px-1 py-0.5">
                                Deprecated
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-text-secondary mt-3 text-left text-xs leading-relaxed min-h-[3.25rem]">
                          {p.manifest.description}
                        </p>

                        {/* Metadata Details */}
                        <div className="mt-4 border-t border-border/50 pt-3 space-y-2 text-left">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-text-muted">Version:</span>
                            <span className="font-semibold text-text-primary">v{p.manifest.version}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-text-muted">Permissions:</span>
                            <span className="flex gap-1 flex-wrap justify-end">
                              {p.manifest.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  className="bg-neutral-light/70 border border-border/40 rounded px-1.5 py-0.5 text-[9px] font-mono text-text-secondary"
                                >
                                  {perm}
                                </span>
                              ))}
                            </span>
                          </div>

                          {p.installed && p.enabled && (
                            <>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-text-muted">MCP Health:</span>
                                <span className="flex items-center gap-1 font-semibold">
                                  {p.health === 'healthy' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                  ) : (
                                    <AlertTriangle className="h-3.5 w-3.5 text-danger" />
                                  )}
                                  {p.health === 'healthy' ? 'Healthy' : 'Degraded'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-text-muted">Avg Latency:</span>
                                <span className="font-semibold text-text-primary">
                                  {p.latencyMs === 0 ? '--' : `${p.latencyMs}ms`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-text-muted">Last Execution:</span>
                                <span className="text-text-secondary truncate max-w-[150px]">
                                  {p.lastExecuted}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="bg-neutral-light/20 border-t border-border/50 flex items-center justify-between gap-2 px-5 py-3">
                        {!p.installed ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center"
                            onClick={() => handleInstall(p)}
                          >
                            Install Connector
                          </Button>
                        ) : (
                          <>
                            <div className="flex gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleEnable(p)}
                                title={p.enabled ? 'Desativar plugin' : 'Ativar plugin'}
                                className={`px-2.5 ${p.enabled ? 'text-success hover:bg-success/10' : 'text-text-muted hover:bg-neutral-light'}`}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenConfigure(p)}
                                title="Configure Credentials"
                                className={`px-2.5 ${hasSecrets ? 'text-primary' : 'text-amber-500 hover:bg-amber-500/10'}`}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUninstall(p)}
                                title="Uninstall Connector"
                                className="px-2.5 text-text-muted hover:bg-danger/10 hover:text-danger"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleUpdate(p)} className="text-xs">
                              v{p.manifest.version}
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {filteredPlugins.length === 0 && (
                  <div className="col-span-full bg-surface border border-border flex flex-col items-center justify-center rounded-xl py-12 px-4 text-center">
                    <Boxes className="h-12 w-12 text-text-muted mt-2" />
                    <h3 className="text-base font-bold text-text-primary mt-4">No Plugins Found</h3>
                    <p className="text-text-secondary text-xs mt-1 max-w-sm">
                      Try searching with other terms or filtering by a different category in the marketplace.
                    </p>
                  </div>
                )}
              </div>
            </Section>
          </Container>
        </main>

        {/* Configure secrets Modal */}
        {configuringPlugin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none">
            <div className="bg-surface border-border max-w-md w-full rounded-xl border p-6 text-left shadow-lg animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Key className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold">Configure {configuringPlugin.manifest.name}</h3>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-text-secondary text-xs leading-relaxed">
                  Enter credentials below. Credentials are encrypted symmetrically using <strong className="text-primary">AES-256-GCM</strong> on your browser and injected safely during tool calls.
                </p>

                {Object.keys(configValues).map((key) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-text-primary text-xs font-semibold capitalize block">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <div className="relative">
                      <Input
                        type={key.includes('token') || key.includes('key') || key.includes('string') ? 'password' : 'text'}
                        placeholder={`Enter ${key}...`}
                        value={configValues[key] || ''}
                        onChange={(e) => setConfigValues({ ...configValues, [key]: e.target.value })}
                        className="pr-10"
                      />
                      <Lock className="text-text-muted absolute top-3.5 right-3 h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfiguringPlugin(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveConfig} className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Encrypt & Save
                </Button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
