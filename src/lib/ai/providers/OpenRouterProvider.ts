import { BaseAIProvider } from './base/BaseAIProvider';
import { AIModel, ChatRequest, ChatResponse, StreamingChunk, TokenUsage } from '../types';

export class OpenRouterProvider implements BaseAIProvider {
  id = 'openrouter' as const;
  name = 'OpenRouter';
  icon = 'globus';
  status: 'active' | 'inactive' | 'error' = 'active';
  capabilities = ['chat', 'streaming', 'multi-provider', 'fallback'];

  private models: AIModel[] = [
    {
      id: 'meta-llama-3-1-405b',
      name: 'Llama 3.1 405B (via OpenRouter)',
      providerId: 'openrouter',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      description: 'Open-weights frontier model with top-tier capability, served through OpenRouter unified proxy.',
      isDefault: true,
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large (via OpenRouter)',
      providerId: 'openrouter',
      contextWindow: 32000,
      maxOutputTokens: 8192,
      description: 'Mistral flagship model with exceptional multilingual comprehension.',
    },
  ];

  async initialize(): Promise<void> {
    // Simulated setup
  }

  async listModels(): Promise<AIModel[]> {
    return this.models;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const modelId = request.modelId;
    const lastUserMessage = request.messages.filter((m) => m.role === 'user').pop()?.content || '';

    // Generate response in a highly technical tone with focus on code and system details
    let responseText = '';
    if (lastUserMessage.toLowerCase().includes('olá') || lastUserMessage.toLowerCase().includes('hello')) {
      responseText = `Olá! Sou a interface OpenRouter proxying (${modelId}). Conexão estável estabelecida. Qual o escopo técnico do nosso debugar ou arquitetar hoje?`;
    } else {
      responseText = `[OpenRouter ${modelId} - Resposta Técnica]
[HTTP 200 OK] -> Proxying through OpenRouter edge gateway...
Iniciando análise técnica da solicitação: "${lastUserMessage}".

\`\`\`json
{
  "request_payload": {
    "query": "${lastUserMessage.replace(/"/g, '\\"')}",
    "timestamp": "${new Date().toISOString()}",
    "model_route": "${modelId}"
  },
  "execution_metrics": {
    "concurrency_limit": "unlimited",
    "edge_cached": false
  }
}
\`\`\`

**Decisões e Detalhes de Baixo Nível (Low-Level)**:
* **Protocolo de Integração**: Recomenda-se utilizar o padrão de transporte SSE (Server-Sent Events) para evitar bloqueio da thread principal.
* **Complexidade Algorítmica**: O algoritmo sugerido opera em complexidade O(N * log N) para processamento em lote, mitigando riscos de estouro de pilha (StackOverflow).
* **Parâmetros de Rede**: Certifique-se de configurar tempos limites de leitura (ReadTimeouts) adequados de no mínimo 30s se estiver roteando payloads de grande dimensão.

Endpoint respondendo perfeitamente. Como deseja otimizar este fluxo de trabalho?`;
    }

    const latencyMs = Date.now() - start + 250; // Low latency proxy simulation
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 18;
    const completionTokens = Math.ceil(responseText.length / 4);
    const usage: TokenUsage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };

    return {
      id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
      message: {
        id: `msg-${Math.random().toString(36).substring(7)}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      },
      modelId,
      providerId: this.id,
      usage,
      latencyMs,
    };
  }

  async stream(request: ChatRequest, onChunk: (chunk: StreamingChunk) => void): Promise<void> {
    const chatResponse = await this.chat(request);
    const text = chatResponse.message.content;
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      onChunk({
        id: chatResponse.id,
        content: words[i] + (i === words.length - 1 ? '' : ' '),
        done: i === words.length - 1,
        ...(i === words.length - 1 ? { usage: chatResponse.usage } : {}),
      });
    }
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    return apiKey.startsWith('sk-or-');
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
    return {
      status: 'healthy',
      latencyMs: 140,
    };
  }
}
