import {
  McpServer,
  McpTool,
  McpResource,
  McpResourceContent,
  McpToolResult,
  McpTransport,
  JSONRPCMessage,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPC_ERRORS,
} from '../types';

export class BaseMcpServer implements McpServer {
  public id: string;
  public name: string;
  public version: string;

  private transport?: McpTransport;
  private tools = new Map<string, { tool: McpTool; handler: (args: Record<string, unknown>) => Promise<McpToolResult> }>();
  private resources = new Map<string, { resource: McpResource; handler: (uri: string) => Promise<McpResourceContent[]> }>();

  constructor(id: string, name: string, version: string) {
    this.id = id;
    this.name = name;
    this.version = version;
  }

  public registerTool(
    tool: McpTool,
    handler: (args: Record<string, unknown>) => Promise<McpToolResult>
  ): void {
    if (this.tools.has(tool.name)) {
      console.warn(`[McpServer: ${this.name}] Overwriting existing tool registration: ${tool.name}`);
    }
    this.tools.set(tool.name, { tool, handler });
  }

  public registerResource(
    resource: McpResource,
    handler: (uri: string) => Promise<McpResourceContent[]>
  ): void {
    if (this.resources.has(resource.uri)) {
      console.warn(`[McpServer: ${this.name}] Overwriting existing resource registration: ${resource.uri}`);
    }
    this.resources.set(resource.uri, { resource, handler });
  }

  public async start(transport: McpTransport): Promise<void> {
    this.transport = transport;

    this.transport.onMessage((msg) => this.handleMessage(msg));
    this.transport.onError((err) => console.error(`[McpServer: ${this.name}] Transport error:`, err));
    this.transport.onClose(() => this.handleClose());

    await this.transport.connect();
  }

  public async stop(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = undefined;
    }
  }

  private async handleMessage(message: JSONRPCMessage): Promise<void> {
    if (!this.transport) return;

    // We only respond to standard JSON-RPC requests containing an id
    if ('id' in message && 'method' in message) {
      const request = message as JSONRPCRequest;

      try {
        const result = await this.routeRequest(request.method, request.params || {});

        const response: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result,
        };

        await this.transport.send(response);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);

        const response: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: JSONRPC_ERRORS.INTERNAL_ERROR.code,
            message: errMsg,
          },
        };

        await this.transport.send(response);
      }
    }
  }

  private async routeRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
    switch (method) {
      case 'initialize':
        return {
          protocolVersion: '1.0.0',
          serverInfo: {
            name: this.name,
            version: this.version,
          },
          capabilities: {
            tools: {},
            resources: {},
          },
        };

      case 'tools/list':
        return {
          tools: Array.from(this.tools.values()).map((t) => t.tool),
        };

      case 'tools/call': {
        const toolName = params.name as string;
        const toolArgs = (params.arguments || {}) as Record<string, unknown>;

        const registration = this.tools.get(toolName);
        if (!registration) {
          throw new Error(`Tool '${toolName}' not found on this MCP server.`);
        }

        return await registration.handler(toolArgs);
      }

      case 'resources/list':
        return {
          resources: Array.from(this.resources.values()).map((r) => r.resource),
        };

      case 'resources/read': {
        const uri = params.uri as string;
        const registration = this.resources.get(uri);
        if (!registration) {
          throw new Error(`Resource '${uri}' not found on this MCP server.`);
        }

        const contents = await registration.handler(uri);
        return { contents };
      }

      default:
        throw new Error(`Method '${method}' is not supported by this MCP server.`);
    }
  }

  private handleClose(): void {
    this.transport = undefined;
  }
}
export default BaseMcpServer;
