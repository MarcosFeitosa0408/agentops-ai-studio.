import { AgentWorker } from './AgentWorker';
import { executeWorkerTask } from './WorkerExecution';
import { WorkerHistoryEntry } from './WorkerHistory';

export interface ScheduledTask {
  id: string;
  workerId: string;
  workerName: string;
  task: string;
  cronExpression: string; // e.g. "Every 5 minutes", "Daily at 9 AM"
  status: 'active' | 'paused';
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

export class WorkerScheduler {
  private static instance: WorkerScheduler;
  private STORAGE_KEY = 'agentops_worker_scheduled_tasks_v1';
  private tasks: ScheduledTask[] = [];
  private hydrated = false;

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): WorkerScheduler {
    if (!WorkerScheduler.instance) {
      WorkerScheduler.instance = new WorkerScheduler();
    }
    return WorkerScheduler.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private hydrate(): void {
    if (this.hydrated) return;
    this.hydrated = true;

    const browser = this.isBrowser();
    if (browser) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.tasks = JSON.parse(stored);
        } else {
          this.tasks = this.getMockSchedules();
          this.save();
        }
      } catch (err) {
        console.error('[WorkerScheduler] Hydration error:', err);
        this.tasks = this.getMockSchedules();
      }
    } else {
      this.tasks = this.getMockSchedules();
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (err) {
      console.error('[WorkerScheduler] Save error:', err);
    }
  }

  private getMockSchedules(): ScheduledTask[] {
    return [
      {
        id: 'sch-1',
        workerId: 'worker-1',
        workerName: 'Data Analyst',
        task: 'Gerar resumo semanal de vendas e faturamento consolidado',
        cronExpression: 'Todas as segundas-feiras às 08:00',
        status: 'active',
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        lastRun: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        nextRun: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      },
      {
        id: 'sch-2',
        workerId: 'worker-3',
        workerName: 'Assistente de Marketing',
        task: 'Análise de engajamento social e performance de campanhas pagas',
        cronExpression: 'Diariamente às 18:00',
        status: 'active',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        lastRun: new Date(Date.now() - 3600000 * 12).toISOString(),
        nextRun: new Date(Date.now() + 3600000 * 12).toISOString(),
      },
    ];
  }

  public list(): ScheduledTask[] {
    this.hydrate();
    return this.tasks;
  }

  public getByWorker(workerId: string): ScheduledTask[] {
    this.hydrate();
    return this.tasks.filter((t) => t.workerId === workerId);
  }

  public create(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'status'>): ScheduledTask {
    const newTask: ScheduledTask = {
      ...task,
      id: `sch-${Math.random().toString(36).substring(2, 9)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextRun: new Date(Date.now() + 3600000 * 4).toISOString(), // mock next run 4 hours from now
    };

    this.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  public toggleStatus(id: string): void {
    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'active' ? 'paused' : 'active',
        };
      }
      return t;
    });
    this.save();
  }

  public delete(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.save();
  }

  /**
   * Triggers a scheduled task execution immediately
   */
  public async triggerImmediately(
    taskId: string,
    worker: AgentWorker,
    options: { workspaceId?: string; userId?: string } = {},
  ): Promise<WorkerHistoryEntry> {
    const scheduledTask = this.tasks.find((t) => t.id === taskId);
    if (!scheduledTask) {
      throw new Error('Scheduled task not found');
    }

    const runResult = await executeWorkerTask(worker, scheduledTask.task, options);

    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          lastRun: new Date().toISOString(),
          nextRun: new Date(Date.now() + 3600000 * 24).toISOString(), // Mock next run 24 hours later
        };
      }
      return t;
    });
    this.save();

    return runResult;
  }

  // Helper method for unit tests to force re-hydration
  public resetHydration(): void {
    this.hydrated = false;
    this.hydrate();
  }
}
