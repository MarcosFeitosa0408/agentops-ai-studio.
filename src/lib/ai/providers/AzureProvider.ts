import { BaseAIProvider } from './base/BaseAIProvider';
import { AIModel, ChatRequest, ChatResponse, StreamingChunk, TokenUsage } from '../types';

export class AzureProvider implements BaseAIProvider {
  id = 'azure' as const;
  name = 'Azure OpenAI';
  icon = 'server';
  status: 'active' | 'inactive' | 'error' = 'active';
  capabilities = ['chat', 'streaming', 'private-vnet', 'active-directory', 'guardrails'];

  private models: AIModel[] = [
    {
      id: 'azure-gpt-4o',
      name: 'GPT-4o (Azure Deployment)',
      providerId: 'azure',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      description: 'Enterprise managed deployment of GPT-4o with integrated Microsoft security and SLA.',
      isDefault: true,
    },
    {
      id: 'azure-gpt-35-turbo',
      name: 'GPT-3.5 Turbo (Azure Deployment)',
      providerId: 'azure',
      contextWindow: 16384,
      maxOutputTokens: 4096,
      description: 'Reliable deployment of GPT-3.5 for standard, high-throughput enterprise workflows.',
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

    // Generate response in an enterprise assistant tone (compliance, security, guardrails)
    let responseText = '';
    if (lastUserMessage.toLowerCase().includes('olá') || lastUserMessage.toLowerCase().includes('hello')) {
      responseText = `Olá! Sou o Assistente Corporativo do Azure OpenAI (${modelId}). Esta sessão está criptografada e em conformidade com as diretrizes de segurança da informação da sua organização. Como posso apoiar os seus processos de negócios hoje?`;
    } else {
      responseText = `[Azure OpenAI ${modelId} - Assistente Corporativo & Compliance]
Esta resposta foi avaliada de acordo com os filtros de segurança e conformidade do Microsoft Purview e Guardrails do Azure AI.
Tratando solicitação corporativa: "${lastUserMessage}".

* **Garantia de Segurança Corporativa**:
  - Dados isolados em sua rede virtual privada (Azure VNet).
  - Criptografia em trânsito (TLS 1.3) e em repouso (AES-256 via chaves gerenciadas pelo cliente).
  - Em conformidade com GDPR, HIPAA e certificações SOC 2 Tipo II.

* **Recomendações Executivas**:
Para prosseguir com sua demanda de forma estruturada e em conformidade com as políticas internas:
1. Certifique-se de que os papéis de acesso (RBAC) estão devidamente configurados no Azure Active Directory.
2. Siga as melhores práticas corporativas detalhadas no Manual do Desenvolvedor para deploys em ambientes produtivos (Staging/Production).
3. Monitore o orçamento de consumo através do painel do Azure Cost Management para manter a eficiência operacional de custos.

Se houver necessidade de análises contratuais ou relatórios auditáveis detalhados, estou à disposição para estruturar o fluxo de dados em total conformidade técnica.`;
    }

    const latencyMs = Date.now() - start + 280; // Secure corporate SLA simulation
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 20;
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
    return apiKey.trim().length > 15;
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
    return {
      status: 'healthy',
      latencyMs: 75, // Microsoft SLA speed
    };
  }
}
