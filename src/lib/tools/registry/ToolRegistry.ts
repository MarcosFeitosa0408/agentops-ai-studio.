import { BaseTool } from '../base/BaseTool';
import { PythonTool } from '../implementations/PythonTool';
import { SQLTool } from '../implementations/SQLTool';
import { ExcelTool } from '../implementations/ExcelTool';
import { CSVTool } from '../implementations/CSVTool';
import { RestApiTool } from '../implementations/RestApiTool';
import { CalculatorTool } from '../implementations/CalculatorTool';
import { JsonTool } from '../implementations/JsonTool';
import { MemoryTool } from '../implementations/MemoryTool';
import { RAGTool } from '../implementations/RAGTool';
import { WebSearchTool } from '../implementations/WebSearchTool';
import { ToolResult } from '../types';
import { PluginRegistry } from '../../mcp/registry/PluginRegistry';
import { PluginTool } from '../base/PluginTool';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private registry = new Map<string, BaseTool>();
  private executionCounts = new Map<string, number>();
  private lastExecutions = new Map<string, string>();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerDefaults(): void {
    // Automatic registration of all mock tools
    this.register(new PythonTool());
    this.register(new SQLTool());
    this.register(new ExcelTool());
    this.register(new CSVTool());
    this.register(new RestApiTool());
    this.register(new CalculatorTool());
    this.register(new JsonTool());
    this.register(new MemoryTool());
    this.register(new RAGTool());
    this.register(new WebSearchTool());
  }

  public register(tool: BaseTool): void {
    if (this.registry.has(tool.id)) {
      console.warn(`[ToolRegistry] Tool with ID ${tool.id} is already registered. Overwriting.`);
    }
    this.registry.set(tool.id, tool);
    if (!this.executionCounts.has(tool.id)) {
      this.executionCounts.set(tool.id, 0);
    }
  }

  public remove(id: string): boolean {
    return this.registry.delete(id);
  }

  public find(id: string): BaseTool | undefined {
    // Check built-in static tools
    const staticTool = this.registry.get(id);
    if (staticTool) return staticTool;

    // Module 7: Check dynamic plugins
    if (id.startsWith('plugin-')) {
      const pluginId = id.replace('plugin-', '');
      const reg = PluginRegistry.getInstance().get(pluginId);
      if (reg && reg.installed && reg.enabled) {
        return new PluginTool(reg);
      }
    }

    return undefined;
  }

  public list(): BaseTool[] {
    const staticTools = Array.from(this.registry.values());

    // Module 7: Dynamically discover installed and enabled MCP Plugins
    const pluginTools = PluginRegistry.getInstance()
      .listEnabled()
      .map((reg) => new PluginTool(reg));

    return [...staticTools, ...pluginTools];
  }

  /**
   * Safe proxy runner of a registered tool execution.
   */
  public async execute(id: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.find(id);
    if (!tool) {
      throw new Error(`Tool with ID '${id}' is not registered.`);
    }
    if (!tool.enabled) {
      throw new Error(`Tool with ID '${id}' is currently disabled.`);
    }

    // Module 8: RBAC Permission Validation
    if (id.startsWith('plugin-')) {
      // Determine user role securely
      let activeRole = 'Viewer';
      if (typeof window !== 'undefined') {
        try {
          const authData = localStorage.getItem('agentops_auth_user');
          if (authData) {
            const user = JSON.parse(authData);
            activeRole = user.role || 'Viewer';
          }
        } catch {
          // Fallback to default
        }
      }

      // Viewer cannot run write operations
      const isWriteAction =
        args.action === 'createIssue' ||
        args.action === 'postMessage' ||
        args.action === 'sendEmail' ||
        args.action === 'createPage' ||
        args.action === 'uploadFile' ||
        args.action === 'writeFile' ||
        /insert|update|delete|drop|alter/i.test(String(args.query || ''));

      if (isWriteAction && activeRole === 'Viewer') {
        throw new Error(`SSO Permission Denied: Your current role '${activeRole}' does not allow executing write/modify actions on this plugin.`);
      }
    }

    // Argument verification
    const valResult = tool.validate(args);
    if (!valResult.valid) {
      throw new Error(`Validation failed for tool '${tool.name}': ${valResult.error}`);
    }

    try {
      const result = await tool.execute(args);

      // Log statistics
      const count = this.executionCounts.get(id) || 0;
      this.executionCounts.set(id, count + 1);
      this.lastExecutions.set(id, new Date().toISOString());

      return result;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Tool execution error: ${errMsg}`,
      };
    }
  }

  /**
   * Health checks all registered tools.
   */
  public async healthCheck(): Promise<Record<string, { status: 'healthy' | 'unhealthy'; message?: string }>> {
    const checks: Record<string, { status: 'healthy' | 'unhealthy'; message?: string }> = {};
    for (const [id, tool] of this.registry.entries()) {
      try {
        checks[id] = await tool.health();
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        checks[id] = { status: 'unhealthy', message: errMsg };
      }
    }
    return checks;
  }

  /**
   * Compute execution counts and analytics.
   */
  public statistics(): {
    totalTools: number;
    enabledCount: number;
    executionCounts: Record<string, number>;
    lastExecutions: Record<string, string>;
  } {
    const enabledCount = this.list().filter((t) => t.enabled).length;
    const execs: Record<string, number> = {};
    const lasts: Record<string, string> = {};

    for (const id of this.registry.keys()) {
      execs[id] = this.executionCounts.get(id) || 0;
      lasts[id] = this.lastExecutions.get(id) || 'Never';
    }

    return {
      totalTools: this.registry.size,
      enabledCount,
      executionCounts: execs,
      lastExecutions: lasts,
    };
  }
}
