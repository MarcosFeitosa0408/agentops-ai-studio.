export type AIProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'azure';

export interface AIProvider {
  id: AIProviderId;
  name: string;
  icon: string; // Icon name from lucide-react or custom SVG path
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
}

export interface AIModel {
  id: string;
  name: string;
  providerId: AIProviderId;
  contextWindow: number;
  maxOutputTokens: number;
  description: string;
  isDefault?: boolean;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

export interface GenerationSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface ChatRequest {
  providerId: AIProviderId;
  modelId: string;
  messages: ChatMessage[];
  settings?: GenerationSettings;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  id: string;
  message: ChatMessage;
  modelId: string;
  providerId: AIProviderId;
  usage: TokenUsage;
  latencyMs: number;
}

export interface ProviderConfig {
  providerId: AIProviderId;
  enabled: boolean;
  apiKey: string;
  customEndpoint?: string;
  selectedModelId: string;
}

export interface StreamingChunk {
  id: string;
  content: string;
  done: boolean;
  usage?: TokenUsage;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  messages: ChatMessage[];
  response?: ChatResponse;
  status: 'pending' | 'success' | 'error';
  error?: string;
  createdAt: string;
}
