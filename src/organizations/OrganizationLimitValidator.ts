import { Organization } from './Organization';
import { OrganizationUsage } from './OrganizationUsage';
import { OrganizationPlans } from './OrganizationPlans';

export class OrganizationLimitValidator {
  static validateWorkerCreation(org: Organization, usage: OrganizationUsage): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.currentWorkers >= limits.maxWorkers) {
      throw new Error(`Limite de workers atingido para o plano ${org.plan} (${limits.maxWorkers}).`);
    }
  }

  static validatePluginInstallation(org: Organization, usage: OrganizationUsage): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.currentPlugins >= limits.maxPlugins) {
      throw new Error(`Limite de plugins atingido para o plano ${org.plan} (${limits.maxPlugins}).`);
    }
  }

  static validateWorkflowCreation(org: Organization, usage: OrganizationUsage): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.currentWorkflows >= limits.maxWorkflows) {
      throw new Error(`Limite de workflows atingido para o plano ${org.plan} (${limits.maxWorkflows}).`);
    }
  }

  static validateMemoryAllocation(org: Organization, usage: OrganizationUsage, requestedBytes: number): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.memoryConsumption + requestedBytes > limits.maxMemory) {
      throw new Error(`Limite de memória cognitiva atingido para o plano ${org.plan} (${(limits.maxMemory / (1024 * 1024)).toFixed(1)} MB).`);
    }
  }

  static validateStorageAllocation(org: Organization, usage: OrganizationUsage, requestedBytes: number): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.storageConsumption + requestedBytes > limits.maxStorage) {
      throw new Error(`Limite de armazenamento em disco atingido para o plano ${org.plan} (${(limits.maxStorage / (1024 * 1024)).toFixed(1)} MB).`);
    }
  }

  static validateApiConsumption(org: Organization, usage: OrganizationUsage): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.apiUsage >= limits.maxApiRequests) {
      throw new Error(`Limite de requisições de API atingido para o plano ${org.plan} (${limits.maxApiRequests}).`);
    }
  }

  static validateDashboardCreation(org: Organization, usage: OrganizationUsage): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.dashboardUsage >= limits.maxDashboards) {
      throw new Error(`Limite de dashboards atingido para o plano ${org.plan} (${limits.maxDashboards}).`);
    }
  }

  static validateExecution(org: Organization, usage: OrganizationUsage): void {
    const limits = OrganizationPlans.getLimits(org.plan);
    if (usage.monthlyExecutions >= limits.maxExecutions) {
      throw new Error(`Limite de execuções mensais atingido para o plano ${org.plan} (${limits.maxExecutions}).`);
    }
  }
}
