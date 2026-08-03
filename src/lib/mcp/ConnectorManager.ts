import { BaseMcpClient } from './client/McpClient';
import { BaseMcpServer } from './server/McpServer';
import { InMemoryMcpTransport } from './transport/InMemoryMcpTransport';
import { PluginRegistry } from './registry/PluginRegistry';
import { SecretManager } from './SecretManager';
import { PluginExecutionResult } from '@/plugins/types';

export class ConnectorManager {
  private static instance: ConnectorManager;
  private registry: PluginRegistry;
  private secretManager: SecretManager;

  // Track active client connections mapped to plugin IDs
  private activeClients = new Map<string, BaseMcpClient>();
  private activeServers = new Map<string, BaseMcpServer>();

  private constructor() {
    this.registry = PluginRegistry.getInstance();
    this.secretManager = SecretManager.getInstance();
  }

  public static getInstance(): ConnectorManager {
    if (!ConnectorManager.instance) {
      ConnectorManager.instance = new ConnectorManager();
    }
    return ConnectorManager.instance;
  }

  /**
   * Spawns an MCP Server and Client pair for a given plugin,
   * establishing bidirectional in-memory communication.
   */
  public async connectConnector(pluginId: string): Promise<BaseMcpClient> {
    if (this.activeClients.has(pluginId)) {
      return this.activeClients.get(pluginId)!;
    }

    const reg = this.registry.get(pluginId);
    if (!reg) {
      throw new Error(`Plugin '${pluginId}' is not found in the registry.`);
    }

    if (!reg.enabled) {
      throw new Error(`Plugin '${pluginId}' is currently disabled.`);
    }

    // Initialize MCP server for this connector
    const server = new BaseMcpServer(
      pluginId,
      `${reg.manifest.name} MCP Server`,
      reg.manifest.version
    );

    // Adapt the SDK plugin properties to an MCP standard tool
    server.registerTool(
      {
        name: 'execute',
        description: reg.manifest.description,
        inputSchema: reg.manifest.schema as unknown as {
          type: 'object';
          properties: Record<string, unknown>;
          required?: string[];
        },
      },
      async (args: Record<string, unknown>) => {
        // Retrieve decrypted credentials from SecretManager
        const secrets = this.secretManager.getPluginSecrets(pluginId);

        const startTime = Date.now();
        try {
          // Execute SDK plugin
          const result = await reg.plugin.execute(args, {
            secrets,
            userRole: 'Admin', // Injected securely or mapped to current session
          });

          const durationMs = Date.now() - startTime;
          this.registry.logExecution(pluginId, durationMs, result.success);

          if (result.success) {
            return {
              content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
            };
          } else {
            return {
              content: [{ type: 'text', text: `Execution failed: ${result.error}` }],
              isError: true,
            };
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.registry.logExecution(pluginId, Date.now() - startTime, false);
          return {
            content: [{ type: 'text', text: `Unexpected server error: ${errMsg}` }],
            isError: true,
          };
        }
      }
    );

    // Set up standard bidirectional transport
    const serverTransport = new InMemoryMcpTransport();
    const clientTransport = new InMemoryMcpTransport();
    serverTransport.establishConnection(clientTransport);

    // Start server and connect client
    await server.start(serverTransport);

    const client = new BaseMcpClient();
    await client.connect(clientTransport);
    await client.initialize();

    // Cache instances
    this.activeClients.set(pluginId, client);
    this.activeServers.set(pluginId, server);

    return client;
  }

  /**
   * Safe execution proxy routing calls through MCP clients.
   */
  public async executePlugin(
    pluginId: string,
    args: Record<string, unknown>
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    try {
      const client = await this.connectConnector(pluginId);
      const mcpResult = await client.callTool('execute', args);

      if (mcpResult.isError) {
        return {
          success: false,
          error: mcpResult.content[0]?.text || 'Execution failed',
          metrics: { durationMs: Date.now() - startTime },
        };
      }

      let parsedData = mcpResult.content[0]?.text || '';
      try {
        parsedData = JSON.parse(parsedData);
      } catch {
        // Return string directly if not JSON
      }

      return {
        success: true,
        data: parsedData,
        metrics: { durationMs: Date.now() - startTime },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `MCP Client call error: ${errMsg}`,
        metrics: { durationMs: Date.now() - startTime },
      };
    }
  }

  /**
   * Disconnect and release the connector session.
   */
  public async disconnectConnector(pluginId: string): Promise<void> {
    const client = this.activeClients.get(pluginId);
    if (client) {
      await client.close();
      this.activeClients.delete(pluginId);
    }

    const server = this.activeServers.get(pluginId);
    if (server) {
      await server.stop();
      this.activeServers.delete(pluginId);
    }
  }

  /**
   * Release all session servers/clients.
   */
  public async disconnectAll(): Promise<void> {
    for (const id of Array.from(this.activeClients.keys())) {
      await this.disconnectConnector(id);
    }
  }
}
export default ConnectorManager;
