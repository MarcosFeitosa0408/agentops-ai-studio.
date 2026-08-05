import { WorkerStatus } from './WorkerStatus';

export interface WorkerHistoryEntry {
  id: string;
  workerId: string;
  workerName: string;
  task: string;
  status: WorkerStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  output?: string;
  error?: string;
  steps?: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    durationMs?: number;
  }[];
}
