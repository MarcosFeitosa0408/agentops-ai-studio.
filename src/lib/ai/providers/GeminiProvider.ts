import { BaseAIProvider } from './base/BaseAIProvider';
import { AIModel, ChatRequest, ChatResponse, StreamingChunk, TokenUsage } from '../types';

export class GeminiProvider implements BaseAIProvider {
  id = 'gemini' as const;
  name = 'Google Gemini';
  icon = 'google';
  status: 'active' | 'inactive' | 'error' = 'active';
  capabilities = ['chat', 'streaming', 'vision', 'multimodal', 'embeddings'];

  private models: AIModel[] = [
    {
      id: 'gemini-1-5-pro',
      name: 'Gemini 1.5 Pro',
      providerId: 'gemini',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      description: 'Extremely large context window (1M tokens), native multimodal understanding.',
      isDefault: true,
    },
    {
      id: 'gemini-1-5-flash',
      name: 'Gemini 1.5 Flash',
      providerId: 'gemini',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      description: 'High-speed, low-latency, highly efficient multimodal model for scale.',
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

    // Generate response in a creative, brainstorming/explanatory tone
    let responseText = '';
    if (lastUserMessage.toLowerCase().includes('olá') || lastUserMessage.toLowerCase().includes('hello')) {
      responseText = `Olá! Sou o Gemini ✨, o cérebro criativo do Google (${modelId}). Que tal iniciarmos uma sessão de brainstorming ou resolvermos uma questão complexa de forma bem visual?`;
    } else {
      responseText = `[Google Gemini ${modelId} - Explicação Criativa]
Que excelente ideia! Vamos visualizar e desdobrar sua solicitação: "${lastUserMessage}" de uma forma bem dinâmica e imaginativa! 🚀

Imagine o seguinte cenário: e se pensássemos nessa solução como uma engrenagem de um relógio de alta precisão? Cada componente tem um papel essencial no ecossistema:
* 💡 **A Faísca Inicial**: Onde a ideia ganha forma, unindo análise lógica e imaginação sem limites.
* 🛠️ **A Estrutura de Sustentação**: Organização pragmática para que a criatividade não se perca no caos.
* 🌀 **O Movimento Perpétuo**: Iteração contínua e aprendizado integrado.

Podemos criar analogias maravilhosas, diagramas conceituais ou até simular caminhos alternativos para dar asas a esse projeto. O que acha de darmos o próximo passo juntos e adicionarmos um toque extra de inovação? ✨`;
    }

    const latencyMs = Date.now() - start + 300; // Fast creative response simulation
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 10;
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
      await new Promise((resolve) => setTimeout(resolve, 20));
      onChunk({
        id: chatResponse.id,
        content: words[i] + (i === words.length - 1 ? '' : ' '),
        done: i === words.length - 1,
        ...(i === words.length - 1 ? { usage: chatResponse.usage } : {}),
      });
    }
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    return apiKey.trim().length > 10;
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
    return {
      status: 'healthy',
      latencyMs: 95,
    };
  }
}
