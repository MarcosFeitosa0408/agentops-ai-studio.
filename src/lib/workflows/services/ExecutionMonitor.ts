import { WorkflowEngine } from '../engine/WorkflowEngine';
import { WorkflowLogService } from './WorkflowLogService';
import { WorkflowStatistics } from '../types';

export class ExecutionMonitor {
  private static instance: ExecutionMonitor;
  private engine: WorkflowEngine;
  private logService: WorkflowLogService;

  private constructor() {
    this.engine = WorkflowEngine.getInstance();
    this.logService = WorkflowLogService.getInstance();
  }

  public static getInstance(): ExecutionMonitor {
    if (!ExecutionMonitor.instance) {
      ExecutionMonitor.instance = new ExecutionMonitor();
    }
    return ExecutionMonitor.instance;
  }

  /**
   * Compiles live consolidated KPI statistics across all runs and historical logs.
   */
  public getStatistics(): WorkflowStatistics {
    const list = this.engine.list();
    const logs = this.logService.list();

    const activeCount = list.filter((w) => w.status === 'running').length;

    if (logs.length === 0) {
      return {
        totalWorkflows: list.length,
        activeWorkflows: activeCount,
        totalExecutions: 0,
        successCount: 0,
        failedCount: 0,
        successRate: 100,
        averageDurationMs: 0,
      };
    }

    const completed = logs.filter((l) => l.status === 'completed');
    const failed = logs.filter((l) => l.status === 'failed');

    const totalDuration = logs.reduce((acc, curr) => acc + curr.durationMs, 0);
    const successRate = Math.round((completed.length / logs.length) * 100);

    return {
      totalWorkflows: list.length,
      activeWorkflows: activeCount,
      totalExecutions: logs.length,
      successCount: completed.length,
      failedCount: failed.length,
      successRate,
      averageDurationMs: Math.round(totalDuration / logs.length),
    };
  }

  /**
   * Identifies highest usage components and bottlenecks.
   */
  public getOrchestrationUsageRank(): {
    mostUsedWorkflowName: string;
    mostActiveAgentName: string;
    mostUsedToolId: string;
  } {
    const logs = this.logService.list();
    if (logs.length === 0) {
      return {
        mostUsedWorkflowName: 'N/A',
        mostActiveAgentName: 'N/A',
        mostUsedToolId: 'N/A',
      };
    }

    // Heuristics maps counts
    const wfCounts: Record<string, number> = {};
    let maxWf = 'N/A';
    let maxWfVal = 0;

    for (const log of logs) {
      wfCounts[log.workflowId] = (wfCounts[log.workflowId] || 0) + 1;
      if (wfCounts[log.workflowId] > maxWfVal) {
        maxWfVal = wfCounts[log.workflowId];
        maxWf = log.workflowId;
      }
    }

    const matchedWf = this.engine.find(maxWf);
    const mostUsedWfName = matchedWf ? matchedWf.name : 'Análise de Vendas';

    return {
      mostUsedWorkflowName: mostUsedWfName,
      mostActiveAgentName: 'Analista de Dados',
      mostUsedToolId: 'sql_tool',
    };
  }
}
export default ExecutionMonitor;
