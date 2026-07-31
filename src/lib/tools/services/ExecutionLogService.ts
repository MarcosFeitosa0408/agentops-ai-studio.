import { ToolExecution } from '../types';

export class ExecutionLogService {
  private static instance: ExecutionLogService;
  private STORAGE_KEY = 'agentops_tool_executions_v1';
  private logs: ToolExecution[] = [];

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): ExecutionLogService {
    if (!ExecutionLogService.instance) {
      ExecutionLogService.instance = new ExecutionLogService();
    }
    return ExecutionLogService.instance;
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
      console.error('[ExecutionLogService] Failed hydration:', err);
      this.logs = this.getMockLogs();
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (err) {
      console.error('[ExecutionLogService] Save failure:', err);
    }
  }

  private getMockLogs(): ToolExecution[] {
    return [
      {
        id: 'exec-1',
        toolId: 'calculator_tool',
        agentId: 'agent-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        input: { expression: '12.5 * 8' },
        status: 'success',
        durationMs: 45,
        output: {
          success: true,
          data: { expression: '12.5 * 8', result: 100, formatted: '12.5 * 8 = 100' },
          metrics: { durationMs: 45 },
        },
      },
      {
        id: 'exec-2',
        toolId: 'python_tool',
        agentId: 'agent-2',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        input: { code: 'df.groupby("category").mean()' },
        status: 'success',
        durationMs: 512,
        output: {
          success: true,
          data: {
            stdout: 'Running analysis...',
            output_value: { total_rows: 5000 },
          },
          metrics: { durationMs: 512 },
        },
      },
    ];
  }

  public log(execution: Omit<ToolExecution, 'id' | 'timestamp'>): ToolExecution {
    const fullLog: ToolExecution = {
      ...execution,
      id: `exec-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(fullLog);
    // Max logs cap
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
    this.save();
    return fullLog;
  }

  public list(): ToolExecution[] {
    this.hydrate();
    return this.logs;
  }

  public getByAgent(agentId: string): ToolExecution[] {
    this.hydrate();
    return this.logs.filter((l) => l.agentId === agentId);
  }

  public clear(): void {
    this.logs = [];
    this.save();
  }
}
