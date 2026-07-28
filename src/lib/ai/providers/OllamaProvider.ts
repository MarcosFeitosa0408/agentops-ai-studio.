import { BaseAIProvider } from './base/BaseAIProvider';
import { AIModel, ChatRequest, ChatResponse, StreamingChunk, TokenUsage } from '../types';

export class OllamaProvider implements BaseAIProvider {
  id = 'ollama' as const;
  name = 'Ollama';
  icon = 'database';
  status: 'active' | 'inactive' | 'error' = 'active';
  capabilities = ['chat', 'streaming', 'local-inference', 'embeddings'];

  private models: AIModel[] = [
    {
      id: 'llama3-8b',
      name: 'Llama 3 (8B)',
      providerId: 'ollama',
      contextWindow: 8192,
      maxOutputTokens: 2048,
      description: 'Local execution of Meta\'s highly performant Llama 3 8B model.',
      isDefault: true,
    },
    {
      id: 'mistral-7b',
      name: 'Mistral (7B)',
      providerId: 'ollama',
      contextWindow: 32000,
      maxOutputTokens: 2048,
      description: 'Excellent local 7B model from Mistral AI, optimized for low resource settings.',
    },
    {
      id: 'phi3-3-8b',
      name: 'Phi-3 (Mini)',
      providerId: 'ollama',
      contextWindow: 128000,
      maxOutputTokens: 2048,
      description: 'Ultra-small reasoning model by Microsoft, running seamlessly on local hardware.',
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

    // Generate response in local execution message tone
    let responseText = '';
    if (lastUserMessage.toLowerCase().includes('olá') || lastUserMessage.toLowerCase().includes('hello')) {
      responseText = `Olá! Sou o Ollama Local (${modelId}). Estou sendo executado diretamente em sua máquina física, garantindo total privacidade. Como posso ajudar com instruções locais hoje?`;
    } else {
      responseText = `[Ollama ${modelId} - Execução Local offline]
Conectado em http://localhost:11434.
Iniciando inferência offline na sua máquina para responder: "${lastUserMessage}".

* **Privacidade Absoluta**: Seus dados nunca sairão de sua infraestrutura local. Nenhuma requisição de nuvem externa ou registro de logs terceirizados foi disparado.
* **Consumo de Hardware**:
  - Modelo carregado inteiramente em VRAM (Placa de Vídeo).
  - Uso estimado de RAM: ~5.2 GB.
  - Velocidade média de geração: 48 tokens por segundo.

* **Resposta do Assistente Local**:
Para solucionar seu problema, podemos rodar scripts locais ou fazer triagens de arquivos sem medo de expor dados confidenciais. Essa abordagem local com o modelo Llama/Mistral é extremamente ágil para tarefas rotineiras de engenharia.

Ollama pronto. O que deseja rodar a seguir?`;
    }

    const latencyMs = Date.now() - start + 80; // Local execution is usually very low network latency, simulated here
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 5;
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
      await new Promise((resolve) => setTimeout(resolve, 10));
      onChunk({
        id: chatResponse.id,
        content: words[i] + (i === words.length - 1 ? '' : ' '),
        done: i === words.length - 1,
        ...(i === words.length - 1 ? { usage: chatResponse.usage } : {}),
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateConnection(_apiKey: string): Promise<boolean> {
    // Local Ollama doesn't require keys, we mock this as true (or key can be empty/any)
    return true;
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
    return {
      status: 'healthy',
      latencyMs: 15, // ultra low latency for localhost check
    };
  }
}
