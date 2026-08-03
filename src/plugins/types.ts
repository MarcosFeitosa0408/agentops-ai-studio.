/**
 * Plugin SDK Type Definitions
 *
 * Defines standard interfaces and schemas for AgentOps AI Studio plugins.
 * Plugins conform to this SDK and map seamlessly onto MCP (Model Context Protocol)
 * tools and servers for dynamic agent discovery.
 */

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string; // Semantic version (e.g. "1.0.0")
  author: string;
  icon: string; // Lucide icon name
  category: string; // e.g. "DevOps", "Collaboration", "Database", "File System"
  permissions: string[]; // Declared list of scopes/permissions (e.g. ["github:read", "github:write"])
  schema: {
    type: 'object';
    properties: Record<string, PluginPropertySchema>;
    required?: string[];
  };
  configSchema?: {
    type: 'object';
    properties: Record<string, PluginPropertySchema>;
    required?: string[];
  };
  isDeprecated?: boolean;
}

export interface PluginPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  defaultValue?: unknown;
}

export interface Plugin {
  manifest: PluginManifest;
  execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult>;
}

export interface PluginExecutionContext {
  workspaceId?: string;
  userId?: string;
  userRole?: string;
  secrets?: Record<string, string>; // Injected configuration keys decrypted by SecretManager
}

export interface PluginExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metrics?: {
    durationMs: number;
    tokensUsed?: number;
  };
}

export interface PluginInstance {
  id: string;
  pluginId: string;
  version: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
