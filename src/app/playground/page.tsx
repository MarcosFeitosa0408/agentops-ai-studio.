'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Sliders,
  HelpCircle,
  Zap,
} from 'lucide-react';

import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAIConfig } from '../../lib/ai/hooks/useAIConfig';
import { AIProviderId, ChatMessage, AIModel, StreamingChunk } from '../../lib/ai/types';
import { AIService } from '../../lib/ai/services/AIService';
import { useToast } from '../../components/ui/Toast';

export default function PlaygroundPage() {
  const {
    configs,
    activeProviderId,
    availableModels,
    generationSettings,
  } = useAIConfig();

  const { toast } = useToast();

  // Selected config overrides for playground
  const [playProviderId, setPlayProviderId] = useState<AIProviderId>(activeProviderId);
  const [playModelId, setPlayModelId] = useState<string>('');
  const [playTemperature, setPlayTemperature] = useState<number>(generationSettings.temperature ?? 0.4);
  const [playMaxTokens, setPlayMaxTokens] = useState<number>(generationSettings.maxTokens ?? 2048);
  const [playPrompt, setPlayPrompt] = useState<string>('');

  // Message history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats for the last response
  const [lastUsage, setLastUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state with global default provider when context updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeProviderId) {
        setPlayProviderId(activeProviderId);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [activeProviderId]);

  // Sync model list when provider changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const providerModels = availableModels.filter((m: AIModel) => m.providerId === playProviderId);
      const activeConfig = configs[playProviderId];

      if (activeConfig && providerModels.some((m: AIModel) => m.id === activeConfig.selectedModelId)) {
        setPlayModelId(activeConfig.selectedModelId);
      } else if (providerModels.length > 0) {
        setPlayModelId(providerModels[0].id);
      } else {
        setPlayModelId('');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [playProviderId, availableModels, configs]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle send prompt
  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!playPrompt.trim() || isGenerating) return;

    // Verify if provider is enabled
    const providerConfig = configs[playProviderId];
    if (providerConfig && !providerConfig.enabled) {
      toast(
        'Provedor Inativo',
        `O provedor ${playProviderId.toUpperCase()} está inativo. Por favor, ative-o nas Configurações.`,
        'danger'
      );
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: playPrompt.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setPlayPrompt('');
    setIsGenerating(true);

    try {
      const aiService = AIService.getInstance();

      // Simulate chat response or stream
      const chatRequest = {
        providerId: playProviderId,
        modelId: playModelId,
        messages: [...messages, userMsg],
        settings: {
          temperature: playTemperature,
          maxTokens: playMaxTokens,
        },
      };

      if (generationSettings.stream) {
        // Stream implementation
        const initialAssistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };

        setMessages((prev: ChatMessage[]) => [...prev, initialAssistantMsg]);

        let completeText = '';
        await aiService.stream(chatRequest, (chunk: StreamingChunk) => {
          completeText += chunk.content;
          setMessages((prev: ChatMessage[]) =>
            prev.map((m: ChatMessage) =>
              m.id === initialAssistantMsg.id
                ? { ...m, content: completeText }
                : m
            )
          );
          if (chunk.usage) {
            setLastUsage({
              promptTokens: chunk.usage.promptTokens,
              completionTokens: chunk.usage.completionTokens,
              totalTokens: chunk.usage.totalTokens,
              latencyMs: 350,
            });
          }
        });
      } else {
        // Simple chat implementation
        const response = await aiService.chat(chatRequest);
        setMessages((prev: ChatMessage[]) => [...prev, response.message]);
        setLastUsage({
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          latencyMs: response.latencyMs,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Erro durante a inferência simulada.';
      toast('Invocação AI Falhou', errMsg, 'danger');

      // Add error message in history
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: `⚠️ [Falha na Simulação]: Não foi possível obter resposta de ${playProviderId.toUpperCase()}. Detalhes: ${errMsg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setLastUsage(null);
    toast('Histórico Limpo', 'O feed de conversas do Playground foi limpo.', 'info');
  };

  const playProviderName = configs[playProviderId] ? playProviderId.toUpperCase() : 'Provedor';
  const providerModels = availableModels.filter((m: AIModel) => m.providerId === playProviderId);

  return (
    <WorkspaceLayout
      activePath="agents" // Keep active layout tab as agents/playground
      title={`AI Playground: ${playProviderName}`}
      breadcrumbs={[{ label: 'Studio' }, { label: 'Playground' }]}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-w-0 shadow-xs">

          {/* Header of Chat */}
          <div className="border-b border-border p-4 bg-neutral-light/20 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              <div className="flex flex-col">
                <span className="text-text-primary text-sm font-bold truncate">
                  Sessão de Conversa Simultânea
                </span>
                <span className="text-text-muted text-[10px]">
                  Visualizador de resposta e tom cognitivo específico de cada modelo
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={handleClearHistory}
              disabled={messages.length === 0}
            >
              Limpar Conversa
            </Button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.length > 0 ? (
              messages.map((m: ChatMessage) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Role Icon */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs select-none ${
                      isUser
                        ? 'bg-primary text-white'
                        : 'bg-neutral-light border border-border text-text-primary dark:bg-neutral-light/10'
                    }`}>
                      {isUser ? 'U' : 'AI'}
                    </div>

                    {/* Bubble Content */}
                    <div className="space-y-1 max-w-[85%]">
                      <div className={`rounded-2xl p-4 text-sm leading-relaxed border ${
                        isUser
                          ? 'bg-primary/5 text-text-primary border-primary/20 rounded-tr-none'
                          : 'bg-neutral-light/30 text-text-primary border-border/50 rounded-tl-none'
                      }`}>
                        {m.content ? (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        ) : (
                          <div className="flex items-center gap-2 text-text-muted select-none">
                            <LoadingSpinner size="xs" />
                            <span>Processando inferência...</span>
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 text-[9px] text-text-muted select-none px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isUser && m.content && (
                          <>
                            <span>&bull;</span>
                            <span className="font-semibold text-primary">{playProviderId.toUpperCase()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
                <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-text-primary text-base font-bold">Inicie sua experimentação de IA</h3>
                <p className="text-text-secondary text-xs mt-1 max-w-md leading-relaxed">
                  Escolha um provedor cognitivo e um modelo de processamento no painel à direita, escreva uma mensagem e observe como o modelo responde com seu tom de comportamento específico.
                </p>
              </div>
            )}

            {/* Generating Loader Bubble */}
            {isGenerating && !messages.some((m: ChatMessage) => m.role === 'assistant' && !m.content) && (
              <div className="flex gap-3 mr-auto max-w-3xl">
                <div className="h-8 w-8 rounded-full bg-neutral-light border border-border flex items-center justify-center text-xs font-bold text-text-primary dark:bg-neutral-light/10 select-none">
                  AI
                </div>
                <div className="rounded-2xl p-4 bg-neutral-light/30 border border-border/50 rounded-tl-none text-sm text-text-muted flex items-center gap-2 select-none">
                  <LoadingSpinner size="xs" />
                  <span>Conectando com o gateway {playProviderId.toUpperCase()}...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Entry Box */}
          <div className="p-4 border-t border-border bg-neutral-light/10 shrink-0">
            <form onSubmit={handleSendPrompt} className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  placeholder={`Envie uma mensagem para o modelo ${playModelId || playProviderName}... (Enter envia)`}
                  value={playPrompt}
                  onChange={(e) => setPlayPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  rows={1}
                  className="py-3 px-4 resize-none max-h-32 bg-card scrollbar-thin rounded-xl"
                  disabled={isGenerating}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="rounded-xl h-[44px] shrink-0"
                disabled={!playPrompt.trim() || isGenerating}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Enviar
              </Button>
            </form>
          </div>

        </div>

        {/* Right Configuration Parameter Settings Panel */}
        <div className="w-full lg:w-80 bg-card border border-border rounded-2xl p-5 space-y-6 select-none shrink-0 overflow-y-auto h-auto lg:h-full shadow-xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Sliders className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-text-primary text-sm font-bold">Parâmetros do Playground</h3>
          </div>

          {/* Model and Provider selection options */}
          <div className="space-y-4">

            {/* Provider Selector */}
            <Select
              label="Provedor de IA"
              value={playProviderId}
              onChange={(e) => setPlayProviderId(e.target.value as AIProviderId)}
            >
              <option value="openai">OpenAI (Profissional)</option>
              <option value="anthropic">Anthropic (Analítico longo)</option>
              <option value="gemini">Google Gemini (Criativo)</option>
              <option value="openrouter">OpenRouter (Json Técnico)</option>
              <option value="ollama">Ollama (Offline local)</option>
              <option value="azure">Azure OpenAI (Enterprise)</option>
            </Select>

            {/* Model Selector */}
            {playModelId ? (
              <Select
                label="Modelo de Linguagem"
                value={playModelId}
                onChange={(e) => setPlayModelId(e.target.value)}
              >
                {providerModels.map((m: AIModel) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="space-y-1">
                <span className="text-text-primary text-xs font-semibold">Modelo de Linguagem</span>
                <div className="text-xs text-danger font-medium border border-danger/20 bg-danger/5 rounded-lg p-2.5">
                  Provedor desativado. Vá em Configurações para ativá-lo.
                </div>
              </div>
            )}

            {/* Micro temperature controller */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-text-primary text-xs font-semibold">Temperatura</span>
                <span className="text-primary font-bold text-xs">{playTemperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playTemperature}
                onChange={(e) => setPlayTemperature(parseFloat(e.target.value))}
                className="bg-border accent-primary h-1 w-full cursor-pointer rounded-lg appearance-none"
              />
            </div>

            {/* Max tokens field */}
            <div className="space-y-1.5">
              <span className="text-text-primary text-xs font-semibold">Limite Máximo de Tokens</span>
              <input
                type="number"
                min="100"
                max="8192"
                step="100"
                value={playMaxTokens}
                onChange={(e) => setPlayMaxTokens(parseInt(e.target.value) || 2048)}
                className="border-border bg-neutral-light/25 w-full rounded-xl border p-2 text-xs focus:outline-hidden"
              />
            </div>

          </div>

          {/* Last response performance stats card */}
          {lastUsage && (
            <div className="bg-neutral-light/30 border border-border/60 rounded-xl p-4 space-y-2.5 animate-in slide-in-from-bottom-2 duration-300">
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-accent animate-pulse" />
                Métricas da Última Geração
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Latência da Resposta</span>
                  <span className="font-bold text-text-primary">{lastUsage.latencyMs}ms</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Prompt de Entrada</span>
                  <span className="font-semibold text-text-primary">{lastUsage.promptTokens} tkn</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Resposta Gerada</span>
                  <span className="font-semibold text-text-primary">{lastUsage.completionTokens} tkn</span>
                </div>

                <div className="border-t border-border/40 my-2 pt-2 flex items-center justify-between text-xs text-text-primary font-bold">
                  <span>Tokens Totais</span>
                  <span className="text-primary">{lastUsage.totalTokens} tokens</span>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines info box */}
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-2 select-none">
            <span className="text-[10px] text-primary font-bold tracking-wider uppercase flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Tons de Resposta
            </span>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              * **OpenAI**: Profissional de negócios.<br />
              * **Anthropic**: Longo, reflexivo e analítico.<br />
              * **Gemini**: Criativo com analogias estruturadas.<br />
              * **OpenRouter**: Resposta técnica em bloco JSON.<br />
              * **Ollama**: Focado em privacidade e offline local.<br />
              * **Azure**: Alinhado a compliance e diretrizes executivas.
            </p>
          </div>

        </div>

      </div>
    </WorkspaceLayout>
  );
}
