import { BaseAIProvider } from './base/BaseAIProvider';
import { AIModel, ChatRequest, ChatResponse, StreamingChunk, TokenUsage } from '../types';

export class OpenAIProvider implements BaseAIProvider {
  id = 'openai' as const;
  name = 'OpenAI';
  icon = 'openai';
  status: 'active' | 'inactive' | 'error' = 'active';
  capabilities = ['chat', 'streaming', 'function-calling', 'vision', 'embeddings'];

  private models: AIModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      providerId: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      description: 'High-intelligence flagship model for complex, multi-modal tasks.',
      isDefault: true,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      providerId: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      description: 'Fast, lightweight, and highly cost-efficient model for high-frequency tasks.',
    },
    {
      id: 'o1-preview',
      name: 'o1 Preview',
      providerId: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 32768,
      description: 'Reasoning model specialized in complex science, math, and coding.',
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

    // Generate a response in a professional assistant tone
    let responseText = '';
    if (lastUserMessage.toLowerCase().includes('olá') || lastUserMessage.toLowerCase().includes('hello')) {
      responseText = `Olá! Sou o assistente virtual da OpenAI (${modelId}). Como posso ajudar com sua análise corporativa e automação hoje?`;
    } else {
      responseText = `[OpenAI ${modelId} - Resposta Profissional] Recebi sua solicitação: "${lastUserMessage}". \n\nCom base nas melhores práticas do setor e em análises estruturadas de processos, sugiro adotarmos uma abordagem modular. O planejamento detalhado garante que todos os casos de teste e fluxos secundários de trabalho sejam mapeados com eficiência. \n\nSe houver requisitos adicionais de integração ou regras de negócio a aplicar, posso detalhar cada um deles individualmente. Como deseja prosseguir?`;
    }

    const latencyMs = Date.now() - start + 400; // Simulated latency
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 15;
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
      await new Promise((resolve) => setTimeout(resolve, 30));
      onChunk({
        id: chatResponse.id,
        content: words[i] + (i === words.length - 1 ? '' : ' '),
        done: i === words.length - 1,
        ...(i === words.length - 1 ? { usage: chatResponse.usage } : {}),
      });
    }
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    return apiKey.trim().length > 5;
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
    return {
      status: 'healthy',
      latencyMs: 120,
    };
  }
}
