export interface OrganizationUsage {
  organizationId: string;
  currentUsers: number;
  currentWorkers: number;
  currentWorkflows: number;
  currentPlugins: number;
  memoryConsumption: number; // in bytes
  storageConsumption: number; // in bytes
  monthlyExecutions: number;
  apiUsage: number;
  dashboardUsage: number;
  workerExecutions: Record<string, number>; // Maps workerId -> execution count
}
