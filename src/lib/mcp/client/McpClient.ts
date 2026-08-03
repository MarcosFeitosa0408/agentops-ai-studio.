import {
  McpClient,
  McpTool,
  McpResource,
  McpResourceContent,
  McpToolResult,
  McpTransport,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCMessage,
} from '../types';

export class BaseMcpClient implements McpClient {
  private transport?: McpTransport;
  private pendingRequests = new Map<
    string | number,
    {
      resolve: (value: unknown) => void;
      reject: (reason: Error) => void;
      timeoutId: NodeJS.Timeout;
    }
  >();
  private nextRequestId = 1;
  private isInitialized = false;

  constructor() {}

  public async connect(transport: McpTransport): Promise<void> {
    this.transport = transport;

    this.transport.onMessage((msg) => this.handleIncomingMessage(msg));
    this.transport.onError((err) => console.error('[McpClient] Transport error:', err));
    this.transport.onClose(() => this.handleClose());

    await this.transport.connect();
  }

  public async initialize(): Promise<Record<string, unknown>> {
    if (this.isInitialized) {
      return { status: 'already_initialized' };
    }

    const res = await this.sendRequest('initialize', {
      protocolVersion: '1.0.0',
      clientInfo: {
        name: 'AgentOps-AI-Studio-Client',
        version: '0.1.0',
      },
    });

    this.isInitialized = true;
    return res as Record<string, unknown>;
  }

  public async listTools(): Promise<McpTool[]> {
    this.ensureInitialized();
    const res = await this.sendRequest('tools/list', {});
    const data = res as { tools?: McpTool[] };
    return data.tools || [];
  }

  public async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    this.ensureInitialized();
    const res = await this.sendRequest('tools/call', { name, arguments: args });
    return res as McpToolResult;
  }

  public async listResources(): Promise<McpResource[]> {
    this.ensureInitialized();
    const res = await this.sendRequest('resources/list', {});
    const data = res as { resources?: McpResource[] };
    return data.resources || [];
  }

  public async readResource(uri: string): Promise<McpResourceContent[]> {
    this.ensureInitialized();
    const res = await this.sendRequest('resources/read', { uri });
    const data = res as { contents?: McpResourceContent[] };
    return data.contents || [];
  }

  public async close(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = undefined;
    }
    this.handleClose();
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('McpClient has not been initialized yet. Run initialize() first.');
    }
  }

  private sendRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
    if (!this.transport) {
      return Promise.reject(new Error('McpClient is not connected to a transport.'));
    }

    const requestId = this.nextRequestId++;

    return new Promise((resolve, reject) => {
      // Set a 10-second timeout
      const timeoutId = setTimeout(() => {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          this.pendingRequests.delete(requestId);
          pending.reject(new Error(`Request timeout: method '${method}' ID ${requestId}`));
        }
      }, 10000);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params,
      };

      this.transport!.send(request).catch((err) => {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        reject(err);
      });
    });
  }

  private handleIncomingMessage(message: JSONRPCMessage): void {
    // Check if it's a JSON-RPC response
    if ('id' in message && ('result' in message || 'error' in message)) {
      const response = message as JSONRPCResponse;
      const pending = this.pendingRequests.get(response.id);

      if (pending) {
        clearTimeout(pending.timeoutId);
        this.pendingRequests.delete(response.id);

        if (response.error) {
          pending.reject(new Error(`MCP error [${response.error.code}]: ${response.error.message}`));
        } else {
          pending.resolve(response.result);
        }
      }
    }
  }

  private handleClose(): void {
    this.isInitialized = false;
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('MCP client disconnected.'));
    }
    this.pendingRequests.clear();
  }
}
export default BaseMcpClient;
