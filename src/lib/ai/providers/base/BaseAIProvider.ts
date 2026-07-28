import { AIModel, ChatRequest, ChatResponse, StreamingChunk } from '../../types';

export interface BaseAIProvider {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];

  initialize(): Promise<void>;
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest, onChunk: (chunk: StreamingChunk) => void): Promise<void>;
  listModels(): Promise<AIModel[]>;
  validateConnection(apiKey: string): Promise<boolean>;
  health(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }>;
}
