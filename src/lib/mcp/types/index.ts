/**
 * Model Context Protocol (MCP) - Core TypeScript Definitions
 *
 * Implements standard interfaces based on the MCP specification,
 * enabling modular, secure, and bidirectional connections between
 * AI models and data sources / tools.
 */

// JSON-RPC 2.0 Base Types
export interface JSONRPCMessage {
  jsonrpc: '2.0';
}

export interface JSONRPCRequest extends JSONRPCMessage {
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCResponse extends JSONRPCMessage {
  id: string | number;
  result?: unknown;
  error?: JSONRPCErrorDetail;
}

export interface JSONRPCNotification extends JSONRPCMessage {
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCErrorDetail {
  code: number;
  message: string;
  data?: unknown;
}

export const JSONRPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: 'Parse error' },
  INVALID_REQUEST: { code: -32600, message: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
  INVALID_PARAMS: { code: -32602, message: 'Invalid params' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
};

// MCP Standard Methods
export type McpMethod =
  | 'initialize'
  | 'tools/list'
  | 'tools/call'
  | 'resources/list'
  | 'resources/read'
  | 'prompts/list'
  | 'prompts/get';

// MCP Tool, Resource, and Prompt Types
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpPrompt {
  name: string;
  description?: string;
  arguments?: McpPromptArgument[];
}

export interface McpPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

// Transport Interface
export interface McpTransport {
  send(message: JSONRPCMessage): Promise<void>;
  onMessage(callback: (message: JSONRPCMessage) => void): void;
  onError(callback: (error: Error) => void): void;
  onClose(callback: () => void): void;
  connect(): Promise<void>;
  close(): Promise<void>;
}

// Client Interface
export interface McpClient {
  initialize(): Promise<Record<string, unknown>>;
  listTools(): Promise<McpTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult>;
  listResources(): Promise<McpResource[]>;
  readResource(uri: string): Promise<McpResourceContent[]>;
  close(): Promise<void>;
}

export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    image?: { data: string; mimeType: string };
  }>;
  isError?: boolean;
}

export interface McpResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// Server Interface
export interface McpServer {
  id: string;
  name: string;
  version: string;
  registerTool(tool: McpTool, handler: (args: Record<string, unknown>) => Promise<McpToolResult>): void;
  registerResource(resource: McpResource, handler: (uri: string) => Promise<McpResourceContent[]>): void;
  start(transport: McpTransport): Promise<void>;
  stop(): Promise<void>;
}
