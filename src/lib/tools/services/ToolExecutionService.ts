import { ToolRegistry } from '../registry/ToolRegistry';
import { ExecutionLogService } from './ExecutionLogService';
import { ToolResult, ToolExecution, ExecutionContext } from '../types';

export class ToolExecutionService {
  private static instance: ToolExecutionService;
  private registry: ToolRegistry;
  private logService: ExecutionLogService;

  private constructor() {
    this.registry = ToolRegistry.getInstance();
    this.logService = ExecutionLogService.getInstance();
  }

  public static getInstance(): ToolExecutionService {
    if (!ToolExecutionService.instance) {
      ToolExecutionService.instance = new ToolExecutionService();
    }
    return ToolExecutionService.instance;
  }

  /**
   * Evaluates permissions, locates, executes and logs tool runs.
   */
  public async executeTool(
    toolId: string,
    input: Record<string, unknown>,
    context?: ExecutionContext,
    options: { retryCount?: number } = {},
  ): Promise<ToolResult> {
    const start = Date.now();
    const tool = this.registry.find(toolId);

    if (!tool) {
      const errRes: ToolResult = {
        success: false,
        error: `Tool with ID '${toolId}' not found in registry.`,
      };
      this.logService.log({
        toolId,
        agentId: context?.agentId,
        input,
        output: errRes,
        status: 'failed',
        durationMs: 0,
      });
      return errRes;
    }

    // Role Permission Validation
    const userRole = context?.userId ? 'Developer' : 'User'; // Simulated contextual fallback
    const permission = tool.permissions.find((p) => p.role === userRole || p.role === 'User');

    if (permission && !permission.allowed) {
      const errRes: ToolResult = {
        success: false,
        error: `Permission Denied: Role '${userRole}' is not allowed to run tool '${tool.name}'.`,
      };
      this.logService.log({
        toolId,
        agentId: context?.agentId,
        input,
        output: errRes,
        status: 'failed',
        durationMs: 0,
      });
      return errRes;
    }

    let retryRemaining = options.retryCount ?? 0;
    let runResult: ToolResult = { success: false };

    while (retryRemaining >= 0) {
      try {
        const res = await this.registry.execute(toolId, input);
        runResult = res;
        if (res.success) break;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        runResult = {
          success: false,
          error: errMsg,
        };
      }

      if (runResult.success) {
        break;
      }

      retryRemaining--;
      if (retryRemaining >= 0) {
        console.warn(`[ToolExecutionService] Execution failed for '${toolId}'. Retrying... Remaining: ${retryRemaining}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    const duration = Date.now() - start;

    // Log the outcome
    this.logService.log({
      toolId,
      agentId: context?.agentId,
      input,
      output: runResult,
      status: runResult.success ? 'success' : 'failed',
      durationMs: duration,
    });

    return {
      ...runResult,
      metrics: {
        durationMs: duration,
        tokensUsed: runResult.metrics?.tokensUsed ?? Math.floor(duration * 0.12),
      },
    };
  }

  public getRegistry(): ToolRegistry {
    return this.registry;
  }

  public getLogs(): ToolExecution[] {
    return this.logService.list();
  }

  public getLogsByAgent(agentId: string): ToolExecution[] {
    return this.logService.getByAgent(agentId);
  }

  public getMetrics(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageLatencyMs: number;
    mostUsedToolId: string;
  } {
    const logs = this.logService.list();
    if (logs.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageLatencyMs: 0,
        mostUsedToolId: 'N/A',
      };
    }

    const successful = logs.filter((l) => l.status === 'success');
    const failed = logs.filter((l) => l.status === 'failed');

    const totalDuration = logs.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);
    const avgLatency = Math.round(totalDuration / logs.length);

    const counts: Record<string, number> = {};
    let mostUsedId = 'N/A';
    let maxCount = 0;

    for (const log of logs) {
      counts[log.toolId] = (counts[log.toolId] || 0) + 1;
      if (counts[log.toolId] > maxCount) {
        maxCount = counts[log.toolId];
        mostUsedId = log.toolId;
      }
    }

    return {
      totalExecutions: logs.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageLatencyMs: avgLatency,
      mostUsedToolId: mostUsedId,
    };
  }
}
export default ToolExecutionService;
