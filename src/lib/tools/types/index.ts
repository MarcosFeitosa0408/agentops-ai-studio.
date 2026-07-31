export type ToolCategory =
  | 'Python'
  | 'SQL'
  | 'REST API'
  | 'HTTP'
  | 'Excel'
  | 'CSV'
  | 'JSON'
  | 'Calculator'
  | 'File System (mock)'
  | 'Memory'
  | 'RAG'
  | 'Web Search (mock)';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: unknown;
}

export type ToolStatus = 'idle' | 'executing' | 'success' | 'failed' | 'healthy' | 'unhealthy';

export type ToolCapability =
  | 'read'
  | 'write'
  | 'execute'
  | 'query'
  | 'search'
  | 'calculate'
  | 'analyze';

export interface ToolPermission {
  role: string;
  allowed: boolean;
  scope?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // Lucide icon name
  enabled: boolean;
  parameters: ToolParameter[];
  permissions: ToolPermission[];
  capabilities: ToolCapability[];
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metrics?: {
    durationMs: number;
    tokensUsed?: number;
  };
}

export interface ToolExecution {
  id: string;
  toolId: string;
  agentId?: string;
  timestamp: string;
  input: Record<string, unknown>;
  output?: ToolResult;
  durationMs?: number;
  status: ToolStatus;
}

export interface ExecutionContext {
  agentId?: string;
  userId?: string;
  sessionId?: string;
  variables: Record<string, unknown>;
  memoryEnabled: boolean;
  ragEnabled: boolean;
}
