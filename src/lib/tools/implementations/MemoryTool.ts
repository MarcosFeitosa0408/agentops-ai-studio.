import { BaseTool } from '../base/BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';
import { MemoryService } from '../../memory/services/MemoryService';

export class MemoryTool extends BaseTool {
  public id = 'memory_tool';
  public name = 'Cognitive Memory Retreiver';
  public description = 'Reads and retrieves relevant cognitive context from the local short-term or long-term Storage.';
  public category: ToolCategory = 'Memory';
  public icon = 'Database';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'query',
      type: 'string',
      description: 'The search query to match memories.',
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      description: 'Maximum number of memories to return.',
      required: false,
      defaultValue: 3,
    },
  ];

  public permissions: ToolPermission[] = [{ role: 'User', allowed: true }];
  public capabilities: ToolCapability[] = ['search', 'read'];

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const query = (args.query as string) || '';
    const limit = (args.limit as number) || 3;

    try {
      const memoryService = MemoryService.getInstance();
      const memories = await memoryService.retrieveMemory(query);
      const sliced = memories.slice(0, limit);

      return {
        success: true,
        data: {
          query,
          count: sliced.length,
          memories: sliced.map((m) => ({
            content: m.item.content,
            scope: m.item.scope,
            category: m.item.category,
            score: m.score,
          })),
        },
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Memory retrieval failure: ${errMsg}`,
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    }
  }
}
