import { McpServer } from '../types';

/**
 * McpServerRegistry maintains a collection of active, running MCP Servers.
 */
export class McpServerRegistry {
  private static instance: McpServerRegistry;
  private servers = new Map<string, McpServer>();

  private constructor() {}

  public static getInstance(): McpServerRegistry {
    if (!McpServerRegistry.instance) {
      McpServerRegistry.instance = new McpServerRegistry();
    }
    return McpServerRegistry.instance;
  }

  public register(server: McpServer): void {
    if (this.servers.has(server.id)) {
      console.warn(`[McpServerRegistry] Overwriting server with ID ${server.id}`);
    }
    this.servers.set(server.id, server);
  }

  public unregister(id: string): boolean {
    const server = this.servers.get(id);
    if (server) {
      server.stop().catch(() => {});
      return this.servers.delete(id);
    }
    return false;
  }

  public get(id: string): McpServer | undefined {
    return this.servers.get(id);
  }

  public list(): McpServer[] {
    return Array.from(this.servers.values());
  }

  public clear(): void {
    for (const server of this.servers.values()) {
      server.stop().catch(() => {});
    }
    this.servers.clear();
  }
}
export default McpServerRegistry;
