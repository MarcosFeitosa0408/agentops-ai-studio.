export type WorkerStatus = 'idle' | 'running' | 'paused' | 'failed' | 'completed' | 'cancelled';

export interface WorkerStatusDetails {
  status: WorkerStatus;
  lastActive: string;
  currentTask?: string;
  progressPercentage?: number;
}
