'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIProviderId, ProviderConfig, AIModel, GenerationSettings } from '../types';
import { AIService } from '../services/AIService';
import { useToast } from '@/components/ui/Toast';

export interface AIConfigContextProps {
  configs: Record<AIProviderId, ProviderConfig>;
  activeProviderId: AIProviderId;
  generationSettings: GenerationSettings;
  availableModels: AIModel[];
  setActiveProviderId: (id: AIProviderId) => void;
  updateProviderConfig: (id: AIProviderId, updates: Partial<ProviderConfig>) => void;
  updateGenerationSettings: (updates: Partial<GenerationSettings>) => void;
  testProviderConnection: (id: AIProviderId) => Promise<boolean>;
  getProviderHealth: (id: AIProviderId) => Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }>;
}

const AIConfigContext = createContext<AIConfigContextProps | undefined>(undefined);

const DEFAULT_CONFIGS: Record<AIProviderId, ProviderConfig> = {
  openai: {
    providerId: 'openai',
    enabled: true,
    apiKey: 'sk-proj-••••••••••••••••••••',
    selectedModelId: 'gpt-4o',
  },
  anthropic: {
    providerId: 'anthropic',
    enabled: true,
    apiKey: 'sk-ant-••••••••••••••••••••',
    selectedModelId: 'claude-3-5-sonnet',
  },
  gemini: {
    providerId: 'gemini',
    enabled: true,
    apiKey: 'ai-gemini-••••••••••••••••••••',
    selectedModelId: 'gemini-1-5-pro',
  },
  openrouter: {
    providerId: 'openrouter',
    enabled: false,
    apiKey: 'sk-or-••••••••••••••••••••',
    selectedModelId: 'meta-llama-3-1-405b',
  },
  ollama: {
    providerId: 'ollama',
    enabled: true,
    apiKey: '', // Local doesn't need key
    selectedModelId: 'llama3-8b',
    customEndpoint: 'http://localhost:11434',
  },
  azure: {
    providerId: 'azure',
    enabled: false,
    apiKey: 'azure-key-••••••••••••••••••••',
    selectedModelId: 'azure-gpt-4o',
    customEndpoint: 'https://agentops-azure.openai.azure.com/',
  },
};

const DEFAULT_SETTINGS: GenerationSettings = {
  temperature: 0.4,
  maxTokens: 2048,
  topP: 0.9,
  stream: false,
};

export const AIConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<Record<AIProviderId, ProviderConfig>>(DEFAULT_CONFIGS);
  const [activeProviderId, setActiveProviderIdState] = useState<AIProviderId>('openai');
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const { toast } = useToast();

  // Load configuration from local storage on mount
  useEffect(() => {
    const storedConfigs = localStorage.getItem('agentops_ai_configs');
    const storedActive = localStorage.getItem('agentops_ai_active_provider');
    const storedSettings = localStorage.getItem('agentops_ai_gen_settings');

    const timer = setTimeout(() => {
      if (storedConfigs) {
        try {
          setConfigs(JSON.parse(storedConfigs));
        } catch (err) {
          console.error('Error loading AI configs from storage', err);
        }
      }

      if (storedActive) {
        setActiveProviderIdState(storedActive as AIProviderId);
      }

      if (storedSettings) {
        try {
          setGenerationSettings(JSON.parse(storedSettings));
        } catch (err) {
          console.error('Error loading Gen settings from storage', err);
        }
      }
    }, 0);

    // Load available models asynchronously
    const loadModels = async () => {
      try {
        const aiService = AIService.getInstance();
        const models = await aiService.listAllModels();
        setAvailableModels(models);
      } catch (err) {
        console.error('Failed to load models list', err);
      }
    };
    loadModels();

    return () => clearTimeout(timer);
  }, []);

  const setActiveProviderId = (id: AIProviderId) => {
    setActiveProviderIdState(id);
    localStorage.setItem('agentops_ai_active_provider', id);
    const aiService = AIService.getInstance();
    aiService.getRegistry().setDefault(id);
    toast('Provedor Alterado', `Provedor padrão definido para "${id.toUpperCase()}"`, 'info');
  };

  const updateProviderConfig = (id: AIProviderId, updates: Partial<ProviderConfig>) => {
    setConfigs((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          ...updates,
        },
      };
      localStorage.setItem('agentops_ai_configs', JSON.stringify(next));

      // Update the status on the registry instances as well
      const aiService = AIService.getInstance();
      const p = aiService.getRegistry().find(id);
      if (p) {
        if (updates.enabled !== undefined) {
          p.status = updates.enabled ? 'active' : 'inactive';
        }
      }

      return next;
    });
  };

  const updateGenerationSettings = (updates: Partial<GenerationSettings>) => {
    setGenerationSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('agentops_ai_gen_settings', JSON.stringify(next));
      return next;
    });
  };

  const testProviderConnection = async (id: AIProviderId): Promise<boolean> => {
    const aiService = AIService.getInstance();
    const provider = aiService.getRegistry().find(id);
    if (!provider) return false;

    const config = configs[id];
    const success = await provider.validateConnection(config.apiKey);

    if (success) {
      toast('Conexão Estabelecida', `Conexão de teste com "${provider.name}" validada com sucesso!`, 'success');
    } else {
      toast('Falha na Conexão', `Não foi possível validar as chaves simuladas para "${provider.name}".`, 'danger');
    }
    return success;
  };

  const getProviderHealth = async (id: AIProviderId): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }> => {
    const aiService = AIService.getInstance();
    const provider = aiService.getRegistry().find(id);
    if (!provider) return { status: 'unhealthy', latencyMs: 0 };
    return await provider.health();
  };

  return (
    <AIConfigContext.Provider
      value={{
        configs,
        activeProviderId,
        generationSettings,
        availableModels,
        setActiveProviderId,
        updateProviderConfig,
        updateGenerationSettings,
        testProviderConnection,
        getProviderHealth,
      }}
    >
      {children}
    </AIConfigContext.Provider>
  );
};

export const useAIConfig = () => {
  const context = useContext(AIConfigContext);
  if (context === undefined) {
    throw new Error('useAIConfig must be used within an AIConfigProvider');
  }
  return context;
};
