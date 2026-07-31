import { Tool, ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';

export abstract class BaseTool implements Tool {
  public abstract id: string;
  public abstract name: string;
  public abstract description: string;
  public abstract category: ToolCategory;
  public abstract icon: string;
  public abstract enabled: boolean;
  public abstract parameters: ToolParameter[];
  public abstract permissions: ToolPermission[];
  public abstract capabilities: ToolCapability[];

  /**
   * Validate that the arguments provided conform to parameter types and requirements.
   */
  public validate(args: Record<string, unknown>): { valid: boolean; error?: string } {
    for (const param of this.parameters) {
      const val = args[param.name];
      if (param.required && (val === undefined || val === null || val === '')) {
        return { valid: false, error: `Parameter '${param.name}' is required but not provided.` };
      }

      if (val !== undefined && val !== null) {
        const typeOfVal = typeof val;
        if (param.type === 'number' && typeOfVal !== 'number') {
          return { valid: false, error: `Parameter '${param.name}' must be of type 'number', got '${typeOfVal}'.` };
        }
        if (param.type === 'boolean' && typeOfVal !== 'boolean') {
          return { valid: false, error: `Parameter '${param.name}' must be of type 'boolean', got '${typeOfVal}'.` };
        }
        if (param.type === 'array' && !Array.isArray(val)) {
          return { valid: false, error: `Parameter '${param.name}' must be of type 'array'.` };
        }
        if (param.type === 'object' && (typeOfVal !== 'object' || Array.isArray(val))) {
          return { valid: false, error: `Parameter '${param.name}' must be of type 'object'.` };
        }
      }
    }
    return { valid: true };
  }

  /**
   * Check tool operational status/health.
   */
  public async health(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string }> {
    return { status: 'healthy', message: `${this.name} is operational.` };
  }

  /**
   * Return serialization/metadata layout of this tool.
   */
  public metadata(): Tool {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      icon: this.icon,
      enabled: this.enabled,
      parameters: this.parameters,
      permissions: this.permissions,
      capabilities: this.capabilities,
    };
  }

  /**
   * Execute the tool with given arguments.
   */
  public abstract execute(args: Record<string, unknown>): Promise<ToolResult>;
}
