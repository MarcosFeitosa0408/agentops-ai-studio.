import { BaseTool } from './BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';
import { ConnectorManager } from '../../mcp/ConnectorManager';
import { RegisteredPlugin } from '../../mcp/registry/PluginRegistry';

/**
 * Dynamic Tool Wrapper for MCP Plugins.
 * This class exposes an active, enabled MCP plugin as a standard AgentOps BaseTool,
 * ensuring seamless dynamic agent-tool discovery with zero manual registration.
 */
export class PluginTool extends BaseTool {
  public id: string;
  public name: string;
  public description: string;
  public category: ToolCategory = 'MCP Plugin';
  public icon: string;
  public enabled: boolean;
  public parameters: ToolParameter[];
  public permissions: ToolPermission[];
  public capabilities: ToolCapability[];
  private pluginId: string;

  constructor(reg: RegisteredPlugin) {
    super();
    this.pluginId = reg.manifest.id;
    this.id = `plugin-${reg.manifest.id}`;
    this.name = reg.manifest.name;
    this.description = reg.manifest.description;
    this.icon = reg.manifest.icon || 'Wrench';
    this.enabled = reg.enabled;

    // Dynamically map manifest properties to ToolParameters
    this.parameters = Object.entries(reg.manifest.schema.properties).map(([name, schema]) => {
      const isRequired = reg.manifest.schema.required?.includes(name) || false;
      return {
        name,
        type: schema.type,
        description: schema.description,
        required: isRequired,
        defaultValue: schema.defaultValue,
      };
    });

    // Map scopes to ToolPermissions
    this.permissions = reg.manifest.permissions.map((scope) => ({
      role: 'Super Admin', // Map default allowed roles or dynamic mapping
      allowed: true,
      scope,
    }));

    // Default capabilities
    this.capabilities = ['execute', 'query'];
  }

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const manager = ConnectorManager.getInstance();
    const startTime = Date.now();

    try {
      // Execute through standard MCP Connector Manager
      const res = await manager.executePlugin(this.pluginId, args);

      return {
        success: res.success,
        data: res.data,
        error: res.error,
        metrics: {
          durationMs: Date.now() - startTime,
        },
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        metrics: {
          durationMs: Date.now() - startTime,
        },
      };
    }
  }
}
export default PluginTool;
