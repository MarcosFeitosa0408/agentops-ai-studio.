import { ProviderRegistry } from './ProviderRegistry';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { AnthropicProvider } from '../providers/AnthropicProvider';
import { GeminiProvider } from '../providers/GeminiProvider';
import { OpenRouterProvider } from '../providers/OpenRouterProvider';
import { OllamaProvider } from '../providers/OllamaProvider';
import { AzureProvider } from '../providers/AzureProvider';
import { ChatRequest, ChatResponse, StreamingChunk, AIModel } from '../types';

export class AIService {
  private static instance: AIService;
  private registry: ProviderRegistry;

  private constructor() {
    this.registry = ProviderRegistry.getInstance();
    this.registerDefaultProviders();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private registerDefaultProviders(): void {
    // Register all implemented providers
    this.registry.register(new OpenAIProvider());
    this.registry.register(new AnthropicProvider());
    this.registry.register(new GeminiProvider());
    this.registry.register(new OpenRouterProvider());
    this.registry.register(new OllamaProvider());
    this.registry.register(new AzureProvider());
  }

  public getRegistry(): ProviderRegistry {
    return this.registry;
  }

  /**
   * Gateway routing for chat generations.
   * Agent components and workspaces must only interact with this method.
   */
  public async chat(request: ChatRequest): Promise<ChatResponse> {
    const provider = this.registry.find(request.providerId);
    if (!provider) {
      throw new Error(`AI Gateway Error: Provider '${request.providerId}' is not registered or supported.`);
    }

    if (provider.status === 'inactive') {
      throw new Error(`AI Gateway Error: Provider '${provider.name}' is currently disabled in your settings.`);
    }

    try {
      // Execute the chat model response
      return await provider.chat(request);
    } catch (err: unknown) {
      console.error(`AI Gateway Error during execution on provider '${request.providerId}':`, err);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`AI Gateway failed to execute generation: ${msg}`);
    }
  }

  /**
   * Streaming support for chat generations.
   */
  public async stream(request: ChatRequest, onChunk: (chunk: StreamingChunk) => void): Promise<void> {
    const provider = this.registry.find(request.providerId);
    if (!provider) {
      throw new Error(`AI Gateway Error: Provider '${request.providerId}' is not registered or supported.`);
    }

    if (provider.status === 'inactive') {
      throw new Error(`AI Gateway Error: Provider '${provider.name}' is currently disabled in your settings.`);
    }

    try {
      await provider.stream(request, onChunk);
    } catch (err: unknown) {
      console.error(`AI Gateway Streaming Error on provider '${request.providerId}':`, err);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`AI Gateway failed streaming: ${msg}`);
    }
  }

  /**
   * Lists all models across all registered providers
   */
  public async listAllModels(): Promise<AIModel[]> {
    const providers = this.registry.list();
    const allModels: AIModel[] = [];

    for (const provider of providers) {
      const models = await provider.listModels();
      allModels.push(...models);
    }

    return allModels;
  }
}

export default AIService;
