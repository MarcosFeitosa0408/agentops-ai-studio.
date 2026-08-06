export type OrganizationPlanType = 'Starter' | 'Pro' | 'Professional' | 'Enterprise' | 'Custom';

export interface OrganizationPlanLimits {
  maxUsers: number;
  maxWorkers: number;
  maxPlugins: number;
  maxWorkflows: number;
  maxMemory: number;
  maxMemoryUsageBytes: number; // Legacy alias of maxMemory for Sprint 11 compatibility
  maxStorage: number;
  maxDashboards: number;
  maxApiRequests: number;
  maxExecutions: number;
}

export const PLAN_LIMITS: Record<OrganizationPlanType, OrganizationPlanLimits> = {
  Starter: {
    maxUsers: 5,
    maxWorkers: 3,
    maxPlugins: 2,
    maxWorkflows: 3,
    maxMemory: 10 * 1024 * 1024, // 10MB
    maxMemoryUsageBytes: 10 * 1024 * 1024,
    maxStorage: 50 * 1024 * 1024, // 50MB
    maxDashboards: 1,
    maxApiRequests: 1000,
    maxExecutions: 500,
  },
  Pro: {
    maxUsers: 25,
    maxWorkers: 15,
    maxPlugins: 8,
    maxWorkflows: 10,
    maxMemory: 100 * 1024 * 1024, // 100MB
    maxMemoryUsageBytes: 100 * 1024 * 1024,
    maxStorage: 500 * 1024 * 1024, // 500MB
    maxDashboards: 5,
    maxApiRequests: 10000,
    maxExecutions: 5000,
  },
  Professional: {
    maxUsers: 25,
    maxWorkers: 15,
    maxPlugins: 8,
    maxWorkflows: 10,
    maxMemory: 100 * 1024 * 1024, // 100MB
    maxMemoryUsageBytes: 100 * 1024 * 1024,
    maxStorage: 500 * 1024 * 1024, // 500MB
    maxDashboards: 5,
    maxApiRequests: 10000,
    maxExecutions: 5000,
  },
  Enterprise: {
    maxUsers: 500,
    maxWorkers: 100,
    maxPlugins: 50,
    maxWorkflows: 100,
    maxMemory: 5 * 1024 * 1024 * 1024, // 5GB
    maxMemoryUsageBytes: 5 * 1024 * 1024 * 1024,
    maxStorage: 50 * 1024 * 1024 * 1024, // 50GB
    maxDashboards: 20,
    maxApiRequests: 500000,
    maxExecutions: 100000,
  },
  Custom: {
    maxUsers: 1000,
    maxWorkers: 250,
    maxPlugins: 100,
    maxWorkflows: 250,
    maxMemory: 10 * 1024 * 1024 * 1024, // 10GB
    maxMemoryUsageBytes: 10 * 1024 * 1024 * 1024,
    maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
    maxDashboards: 50,
    maxApiRequests: 1000000,
    maxExecutions: 250000,
  },
};

export class OrganizationPlans {
  static getLimits(plan: OrganizationPlanType): OrganizationPlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.Starter;
  }

  static checkLimit(
    plan: OrganizationPlanType,
    metric: keyof OrganizationPlanLimits,
    currentValue: number,
  ): boolean {
    const limits = this.getLimits(plan);
    return currentValue < limits[metric];
  }
}
