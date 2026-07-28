import { BaseAIProvider } from './base/BaseAIProvider';
import { AIModel, ChatRequest, ChatResponse, StreamingChunk, TokenUsage } from '../types';

export class AnthropicProvider implements BaseAIProvider {
  id = 'anthropic' as const;
  name = 'Anthropic';
  icon = 'anthropic';
  status: 'active' | 'inactive' | 'error' = 'active';
  capabilities = ['chat', 'streaming', 'vision', 'embeddings'];

  private models: AIModel[] = [
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      providerId: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      description: 'Most intelligent, context-rich model. Ideal for complex research and data synthesis.',
      isDefault: true,
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      providerId: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      description: 'Ultra-fast, light model optimized for high-volume quick reasoning.',
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      providerId: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      description: 'Powerful model for highly sophisticated synthesis, planning, and strategy.',
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

    // Generate response in a long analytical explanation tone
    let responseText = '';
    if (lastUserMessage.toLowerCase().includes('olá') || lastUserMessage.toLowerCase().includes('hello')) {
      responseText = `Olá! Sou o Claude, modelo analítico desenvolvido pela Anthropic (${modelId}). Como posso ajudar em suas tarefas de pesquisa conceitual ou engenharia de sistemas hoje?`;
    } else {
      responseText = `[Anthropic ${modelId} - Explicação Analítica Longa]
Aprecio a profundidade e complexidade da questão que você trouxe. Para podermos investigar a pergunta: "${lastUserMessage}", precisamos estruturar nossa investigação em três perspectivas fundamentais:

1. **Contexto Conceitual e Arquitetura**:
   Primeiramente, analisar a viabilidade conceitual garante que não tenhamos gargalos lógicos. O processamento analítico requer isolar as variáveis cruciais e modelá-las em camadas independentes.

2. **Detalhamento dos Mecanismos de Ação**:
   Do ponto de vista prático, a implementação se beneficiará grandemente de um acoplamento fraco e alta coesão entre os componentes. Isso simplifica a manutenção futura e favorece uma auditoria clara das decisões tomadas.

3. **Análise de Custos e Compensações (Trade-offs)**:
   Embora metodologias tradicionais ofereçam previsibilidade, abordagens adaptativas baseadas em IA entregam flexibilidade de runtime incomparável. No entanto, é fundamental balancear os trade-offs de latência versus riqueza contextual para evitar degradação de performance.

Em suma, essa análise modular fornece uma fundação sólida para construirmos a melhor estratégia possível. Sinta-se à vontade para expandir em qualquer uma das subseções estruturadas acima.`;
    }

    const latencyMs = Date.now() - start + 500; // Analytical thinking latency simulation
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 12;
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
    return apiKey.startsWith('sk-ant-');
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
    return {
      status: 'healthy',
      latencyMs: 150,
    };
  }
}
