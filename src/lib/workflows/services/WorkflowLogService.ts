import { WorkflowLog } from '../types';

export class WorkflowLogService {
  private static instance: WorkflowLogService;
  private STORAGE_KEY = 'agentops_workflow_logs_v1';
  private logs: WorkflowLog[] = [];

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): WorkflowLogService {
    if (!WorkflowLogService.instance) {
      WorkflowLogService.instance = new WorkflowLogService();
    }
    return WorkflowLogService.instance;
  }

  private hydrate(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      } else {
        this.logs = this.getMockLogs();
        this.save();
      }
    } catch (err) {
      console.error('[WorkflowLogService] Hydration error:', err);
      this.logs = this.getMockLogs();
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (err) {
      console.error('[WorkflowLogService] Save error:', err);
    }
  }

  private getMockLogs(): WorkflowLog[] {
    return [
      {
        id: 'log-1',
        workflowId: 'wf-1',
        executionId: 'exec-mock-1',
        status: 'completed',
        durationMs: 1450,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        input: { initialQuery: 'Análise de vendas Q1' },
        output: { result: 'Relatório sintetizado e salvo com sucesso.' },
        executionPath: ['node-start', 'node-sql', 'node-condition', 'node-agent'],
      },
    ];
  }

  public log(item: Omit<WorkflowLog, 'id'>): WorkflowLog {
    const newLog: WorkflowLog = {
      ...item,
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
    };

    this.logs.unshift(newLog);
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    this.save();
    return newLog;
  }

  public list(): WorkflowLog[] {
    this.hydrate();
    return this.logs;
  }

  public getByWorkflow(workflowId: string): WorkflowLog[] {
    this.hydrate();
    return this.logs.filter((l) => l.workflowId === workflowId);
  }

  public clear(): void {
    this.logs = [];
    this.save();
  }
}
export default WorkflowLogService;
