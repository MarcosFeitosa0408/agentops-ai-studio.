export type LogSeverity = 'info' | 'warning' | 'error';

export interface StandardizedLog {
  id: string;
  timestamp: string;
  workspace: string;
  user: string;
  agent: string;
  plugin: string;
  workflow: string;
  duration: number; // ms
  result: string;
  error: string | null;
  severity: LogSeverity;
}

export class StandardizedLoggingService {
  private static instance: StandardizedLoggingService;
  private STORAGE_KEY = 'agentops_standardized_logs_v1';
  private logs: StandardizedLog[] = [];

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): StandardizedLoggingService {
    if (!StandardizedLoggingService.instance) {
      StandardizedLoggingService.instance = new StandardizedLoggingService();
    }
    return StandardizedLoggingService.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private hydrate(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      } else {
        this.logs = [];
      }
    } catch (err) {
      console.error('[StandardizedLoggingService] Hydration failure:', err);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (err) {
      console.error('[StandardizedLoggingService] Save failure:', err);
    }
  }

  public log(logParams: Omit<StandardizedLog, 'id' | 'timestamp'>): StandardizedLog {
    const newLog: StandardizedLog = {
      ...logParams,
      id: `log-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(newLog);

    // Keep memory footprint reasonable
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    this.save();
    return newLog;
  }

  public list(): StandardizedLog[] {
    this.hydrate();
    return this.logs;
  }

  public getByWorkspace(workspaceId: string): StandardizedLog[] {
    this.hydrate();
    return this.logs.filter((l) => l.workspace === workspaceId);
  }

  public clear(): void {
    this.logs = [];
    this.save();
  }
}

export default StandardizedLoggingService;
