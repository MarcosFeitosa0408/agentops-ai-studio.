import { BaseTool } from '../base/BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';
import { RetrievalService } from '../../rag/services/RetrievalService';

export class RAGTool extends BaseTool {
  public id = 'rag_tool';
  public name = 'RAG Document Locator';
  public description = 'Locates, chunks, and matches indexed semantic context from knowledge base document files.';
  public category: ToolCategory = 'RAG';
  public icon = 'BookOpen';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'query',
      type: 'string',
      description: 'The semantic query to run against documents.',
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      description: 'Maximum number of chunks to fetch.',
      required: false,
      defaultValue: 2,
    },
  ];

  public permissions: ToolPermission[] = [{ role: 'User', allowed: true }];
  public capabilities: ToolCapability[] = ['search', 'read'];

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const query = (args.query as string) || '';
    const limit = (args.limit as number) || 2;

    try {
      const ragService = RetrievalService.getInstance();
      const results = await ragService.retrieve(query, { limit });

      return {
        success: true,
        data: {
          query,
          found: results.length,
          chunks: results.map((r) => ({
            documentName: r.reference.documentName,
            pageNumber: r.reference.pageNumber,
            content: r.reference.content,
            score: r.score,
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
        error: `RAG locate failure: ${errMsg}`,
        metrics: {
          durationMs: Date.now() - start,
        },
      };
    }
  }
}
