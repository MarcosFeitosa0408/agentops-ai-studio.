import { BaseTool } from '../base/BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';

export class JsonTool extends BaseTool {
  public id = 'json_tool';
  public name = 'JSON Syntactical Structurer';
  public description = 'Validates, minifies, or pretty prints structured schema metadata and properties.';
  public category: ToolCategory = 'JSON';
  public icon = 'Braces';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'jsonString',
      type: 'string',
      description: 'The JSON content to format/evaluate.',
      required: true,
    },
    {
      name: 'minify',
      type: 'boolean',
      description: 'Should minify instead of pretty printing.',
      required: false,
      defaultValue: false,
    },
  ];

  public permissions: ToolPermission[] = [{ role: 'User', allowed: true }];
  public capabilities: ToolCapability[] = ['read', 'write'];

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const str = (args.jsonString as string) || '';
    const minify = !!args.minify;

    try {
      const parsed = JSON.parse(str) as Record<string, unknown>;
      const output = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);

      return {
        success: true,
        data: {
          valid: true,
          formatted: output,
          keys: Object.keys(parsed),
          sizeBytes: output.length,
        },
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `JSON syntactic error: ${errMsg}`,
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    }
  }
}
