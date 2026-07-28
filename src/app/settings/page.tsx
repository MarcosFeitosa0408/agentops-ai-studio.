'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAIConfig } from '../../lib/ai/hooks/useAIConfig';
import { AIProviderId } from '../../lib/ai/types';

export default function SettingsPage() {
  const {
    configs,
    activeProviderId,
    generationSettings,
    availableModels,
    setActiveProviderId,
    updateProviderConfig,
    updateGenerationSettings,
    testProviderConnection,
    getProviderHealth,
  } = useAIConfig();

  const [selectedConfigProvider, setSelectedConfigProvider] = useState<AIProviderId>('openai');
  const [testingId, setTestingId] = useState<AIProviderId | null>(null);

  // Health states for each provider
  const [healthStatus, setHealthStatus] = useState<Record<string, { status: 'healthy' | 'unhealthy'; latencyMs: number }>>({});
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  const activeConfig = configs[selectedConfigProvider];
  const providerModels = availableModels.filter((m) => m.providerId === selectedConfigProvider);

  // Refresh health of all providers
  const refreshAllHealth = async () => {
    setIsRefreshingHealth(true);
    const statuses: Record<string, { status: 'healthy' | 'unhealthy'; latencyMs: number }> = {};
    const providers: AIProviderId[] = ['openai', 'anthropic', 'gemini', 'openrouter', 'ollama', 'azure'];

    for (const p of providers) {
      if (configs[p]?.enabled) {
        const h = await getProviderHealth(p);
        statuses[p] = h;
      } else {
        statuses[p] = { status: 'unhealthy', latencyMs: 0 };
      }
    }
    setHealthStatus(statuses);
    setIsRefreshingHealth(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAllHealth();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs]);

  const handleTestConnection = async (id: AIProviderId) => {
    setTestingId(id);
    await new Promise((r) => setTimeout(r, 600)); // simulation delay
    await testProviderConnection(id);
    setTestingId(null);
  };

  const providersList = [
    { id: 'openai' as const, name: 'OpenAI', desc: 'Líder em modelos generativos de propósito geral' },
    { id: 'anthropic' as const, name: 'Anthropic', desc: 'Pioneira em segurança e raciocínio analítico' },
    { id: 'gemini' as const, name: 'Google Gemini', desc: 'Incrível janela de contexto e multimodalidade nativa' },
    { id: 'openrouter' as const, name: 'OpenRouter', desc: 'Proxy unificado para múltiplos modelos open-weights' },
    { id: 'ollama' as const, name: 'Ollama', desc: 'Modelos locais executados 100% offline' },
    { id: 'azure' as const, name: 'Azure OpenAI', desc: 'Instâncias privadas com segurança de nível enterprise' },
  ];

  return (
    <WorkspaceLayout
      activePath="dashboard" // Keep active path as dashboard or neutral highlight
      title="Configurações do AI Core"
      breadcrumbs={[{ label: 'Studio' }, { label: 'Configurações' }]}
    >
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">

        {/* Intro banner */}
        <div className="border-border bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-2xl border p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-text-primary text-lg font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Arquitetura de Provedores Multi-LLM
              </h2>
              <p className="text-text-secondary text-xs max-w-2xl leading-relaxed">
                Configure os tokens de API, parâmetros globais de inferência e conectividade de rede. O AgentOps AI Gateway abstrai todas as comunicações para garantir segurança e robustez corporativa.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshingHealth ? 'animate-spin' : ''}`} />}
              onClick={refreshAllHealth}
              disabled={isRefreshingHealth}
            >
              Testar Latência Global
            </Button>
          </div>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Provedores selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-text-primary text-sm font-bold tracking-wider uppercase px-1">
              Provedores Disponíveis
            </h3>

            <div className="space-y-3">
              {providersList.map((p) => {
                const config = configs[p.id];
                const isActiveDefault = activeProviderId === p.id;
                const isSelected = selectedConfigProvider === p.id;
                const health = healthStatus[p.id];

                return (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-border hover:border-text-muted/40'
                    }`}
                    onClick={() => setSelectedConfigProvider(p.id)}
                  >
                    <div className="p-4 flex items-start gap-3 justify-between">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text-primary truncate">
                            {p.name}
                          </span>
                          {config?.enabled ? (
                            <Badge variant="success" size="sm">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm" className="bg-neutral-light/50">
                              Inativo
                            </Badge>
                          )}
                          {isActiveDefault && (
                            <Badge variant="primary" size="sm" pill>
                              Padrão
                            </Badge>
                          )}
                        </div>
                        <p className="text-text-secondary text-[11px] leading-normal line-clamp-2">
                          {p.desc}
                        </p>

                        {/* Health status details */}
                        {config?.enabled && health && (
                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-text-muted">
                            <span className={`h-1.5 w-1.5 rounded-full ${health.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                            <span>
                              {health.status === 'healthy' ? `Conectado (${health.latencyMs}ms)` : 'Offline'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Individual Provider details & Configuration parameters */}
          <div className="lg:col-span-2 space-y-8">

            {/* Active Provider specific configuration */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      Configuração: {providersList.find((p) => p.id === selectedConfigProvider)?.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ative o provedor e configure as chaves secretas de segurança de forma simulada.
                    </CardDescription>
                  </div>

                  {/* Default button */}
                  {activeConfig?.enabled && activeProviderId !== selectedConfigProvider && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => setActiveProviderId(selectedConfigProvider)}
                    >
                      Definir como Padrão
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">

                {/* Enabled Toggle Switch */}
                <div className="bg-neutral-light/30 rounded-xl border border-border/40 p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-text-primary">Ativar Provedor</span>
                    <p className="text-text-muted text-[11px]">
                      Habilite ou desabilite este cérebro de inferência para seus agentes de IA.
                    </p>
                  </div>
                  <Switch
                    checked={!!activeConfig?.enabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      updateProviderConfig(selectedConfigProvider, { enabled: checked });
                      if (!checked && activeProviderId === selectedConfigProvider) {
                        // Find first enabled provider to set as default fallback
                        const fallback = providersList.find((p) => p.id !== selectedConfigProvider && configs[p.id]?.enabled);
                        if (fallback) {
                          setActiveProviderId(fallback.id);
                        }
                      }
                    }}
                  />
                </div>

                {activeConfig?.enabled ? (
                  <div className="space-y-5 animate-in fade-in duration-200">

                    {/* API Key placeholder */}
                    {selectedConfigProvider !== 'ollama' && (
                      <Input
                        label="Chave de API do Provedor"
                        type="password"
                        placeholder="sk-proj-••••••••••••••••••••"
                        value={activeConfig?.apiKey || ''}
                        onChange={(e) => updateProviderConfig(selectedConfigProvider, { apiKey: e.target.value })}
                        leftElement={<Key className="h-4 w-4 text-text-muted" />}
                        helperText="Sua chave secreta nunca é exposta no frontend. Utilizado mock sandbox."
                      />
                    )}

                    {/* Custom Endpoint */}
                    {(selectedConfigProvider === 'ollama' || selectedConfigProvider === 'azure' || selectedConfigProvider === 'openrouter') && (
                      <Input
                        label="Endpoint de Hospedagem / API"
                        placeholder={selectedConfigProvider === 'ollama' ? 'http://localhost:11434' : 'https://api.yourcompany.com/'}
                        value={activeConfig?.customEndpoint || ''}
                        onChange={(e) => updateProviderConfig(selectedConfigProvider, { customEndpoint: e.target.value })}
                        helperText="URL de roteamento customizado para conexões com servidores dedicados."
                      />
                    )}

                    {/* Select Model Default */}
                    <Select
                      label="Modelo Padrão do Provedor"
                      value={activeConfig?.selectedModelId || ''}
                      onChange={(e) => updateProviderConfig(selectedConfigProvider, { selectedModelId: e.target.value })}
                      helperText="O modelo principal que este provedor instanciará por padrão."
                    >
                      {providerModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow / 1000}k context)
                        </option>
                      ))}
                    </Select>

                    {/* Connection status and validation action */}
                    <div className="border-t border-border/50 pt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {healthStatus[selectedConfigProvider]?.status === 'healthy' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-success font-semibold">
                            <CheckCircle className="h-4 w-4" />
                            Pronto para Produção
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-semibold">
                            <XCircle className="h-4 w-4 text-danger" />
                            Aguardando credenciais
                          </span>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={testingId === selectedConfigProvider}
                        onClick={() => handleTestConnection(selectedConfigProvider)}
                      >
                        Testar Conectividade
                      </Button>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center bg-neutral-light/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center space-y-2">
                    <Info className="h-6 w-6 text-text-muted" />
                    <span className="text-sm font-bold text-text-primary">Este provedor está inativo</span>
                    <p className="text-text-muted text-xs max-w-sm">
                      Ative o switch acima para habilitar as parametrizações de credenciais e chaves de API deste motor LLM.
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Global Generation Parameters Settings */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Parâmetros de Geração Padrão
                </CardTitle>
                <CardDescription className="text-xs">
                  Ajuste os parâmetros padrão que governarão o comportamento heurístico dos agentes criados.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">

                {/* Temperature range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between select-none">
                    <span className="text-sm font-semibold text-text-primary">Temperatura Heurística</span>
                    <span className="text-primary font-bold text-sm">{(generationSettings.temperature ?? 0.4).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={generationSettings.temperature ?? 0.4}
                    onChange={(e) => updateGenerationSettings({ temperature: parseFloat(e.target.value) })}
                    className="bg-border accent-primary h-1.5 w-full cursor-pointer rounded-lg appearance-none"
                  />
                  <p className="text-text-muted text-[10px]">
                    Valores baixos focam em respostas exatas, analíticas e estruturadas. Valores altos promovem ideias abstratas e criativas.
                  </p>
                </div>

                {/* Tokens inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Max tokens */}
                  <div className="space-y-1.5">
                    <label className="text-text-primary text-sm font-semibold">Tamanho Máximo de Resposta (Tokens)</label>
                    <input
                      type="number"
                      min="100"
                      max="16384"
                      step="100"
                      value={generationSettings.maxTokens ?? 2048}
                      onChange={(e) => updateGenerationSettings({ maxTokens: parseInt(e.target.value) || 2048 })}
                      className="border-border bg-neutral-light/25 focus:border-primary w-full rounded-xl border p-3 text-sm focus:outline-hidden"
                    />
                    <p className="text-text-muted text-[10px]">Limite superior de tokens gerados em cada loop.</p>
                  </div>

                  {/* Top P */}
                  <div className="space-y-1.5">
                    <label className="text-text-primary text-sm font-semibold">Top P (Nucleus Sampling)</label>
                    <input
                      type="number"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={generationSettings.topP ?? 0.9}
                      onChange={(e) => updateGenerationSettings({ topP: parseFloat(e.target.value) || 0.9 })}
                      className="border-border bg-neutral-light/25 focus:border-primary w-full rounded-xl border p-3 text-sm focus:outline-hidden"
                    />
                    <p className="text-text-muted text-[10px]">Controle de probabilidade acumulada das palavras.</p>
                  </div>

                </div>

                {/* Streaming option */}
                <div className="bg-neutral-light/30 border border-border/40 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-text-primary">Habilitar Transmissão Gradual (Streaming)</span>
                    <p className="text-text-muted text-[11px]">
                      Exibe as palavras à medida que são processadas. Recomendado desativar no simulador.
                    </p>
                  </div>
                  <Switch
                    checked={!!generationSettings.stream}
                    onChange={(e) => {
                      updateGenerationSettings({ stream: e.target.checked });
                    }}
                  />
                </div>

              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </WorkspaceLayout>
  );
}
