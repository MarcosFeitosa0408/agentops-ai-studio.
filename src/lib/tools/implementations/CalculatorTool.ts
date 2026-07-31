import { BaseTool } from '../base/BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';

export class CalculatorTool extends BaseTool {
  public id = 'calculator_tool';
  public name = 'High Precision Calculator';
  public description = 'Performs direct, accurate mathematical formulas or logical equations.';
  public category: ToolCategory = 'Calculator';
  public icon = 'Calculator';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'expression',
      type: 'string',
      description: 'The mathematical expression to evaluate (e.g. "150 * (32 / 4) + 12.5").',
      required: true,
    },
  ];

  public permissions: ToolPermission[] = [{ role: 'User', allowed: true }];
  public capabilities: ToolCapability[] = ['calculate'];

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const expression = (args.expression as string) || '';

    // Secure math sandbox execution using JS eval containing strict token filters
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      if (sanitized !== expression) {
        throw new Error('Invalid mathematical syntax in expression.');
      }

      const result = eval(sanitized);

      return {
        success: true,
        data: {
          expression,
          result: Number(result),
          formatted: `${expression} = ${result}`,
        },
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Calculation failure: ${errMsg}`,
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    }
  }
}
