export type OrganizationPlanType = 'Starter' | 'Pro' | 'Enterprise';

export interface OrganizationPlanLimits {
  maxUsers: number;
  maxWorkers: number;
  maxPlugins: number;
  maxWorkflows: number;
  maxMemoryUsageBytes: number;
  maxDashboards: number;
}

export const PLAN_LIMITS: Record<OrganizationPlanType, OrganizationPlanLimits> = {
  Starter: {
    maxUsers: 5,
    maxWorkers: 3,
    maxPlugins: 2,
    maxWorkflows: 3,
    maxMemoryUsageBytes: 10 * 1024 * 1024, // 10MB
    maxDashboards: 1,
  },
  Pro: {
    maxUsers: 20,
    maxWorkers: 15,
    maxPlugins: 8,
    maxWorkflows: 10,
    maxMemoryUsageBytes: 100 * 1024 * 1024, // 100MB
    maxDashboards: 5,
  },
  Enterprise: {
    maxUsers: 500,
    maxWorkers: 100,
    maxPlugins: 50,
    maxWorkflows: 100,
    maxMemoryUsageBytes: 5 * 1024 * 1024 * 1024, // 5GB
    maxDashboards: 20,
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
