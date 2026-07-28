import { BaseAIProvider } from '../providers/base/BaseAIProvider';
import { AIProviderId } from '../types';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<AIProviderId, BaseAIProvider> = new Map();
  private defaultProviderId: AIProviderId = 'openai';

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(provider: BaseAIProvider): void {
    this.providers.set(provider.id as AIProviderId, provider);
  }

  public remove(id: AIProviderId): boolean {
    return this.providers.delete(id);
  }

  public find(id: AIProviderId): BaseAIProvider | undefined {
    return this.providers.get(id);
  }

  public list(): BaseAIProvider[] {
    return Array.from(this.providers.values());
  }

  public getDefault(): BaseAIProvider {
    const provider = this.find(this.defaultProviderId);
    if (!provider) {
      // Fallback to any registered provider if default isn't registered
      const first = this.providers.values().next().value;
      if (!first) {
        throw new Error('No AI providers registered in the ProviderRegistry!');
      }
      return first;
    }
    return provider;
  }

  public setDefault(id: AIProviderId): void {
    if (!this.providers.has(id)) {
      throw new Error(`Cannot set default provider to non-registered ID: ${id}`);
    }
    this.defaultProviderId = id;
  }
}
export default ProviderRegistry;
