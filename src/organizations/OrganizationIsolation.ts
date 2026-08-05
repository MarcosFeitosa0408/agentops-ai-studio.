import { OrganizationManager } from './OrganizationManager';

export class OrganizationIsolation {
  static isUserAllowed(userId: string): boolean {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return org.users.includes(userId);
  }

  static isWorkerAllowed(workerId: string): boolean {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return org.workers.includes(workerId);
  }

  static isPluginAllowed(pluginId: string): boolean {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return org.plugins.includes(pluginId);
  }

  static isWorkflowAllowed(workflowId: string): boolean {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return org.workflows.includes(workflowId);
  }

  static isDashboardAllowed(dashboardId: string): boolean {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return org.dashboards.includes(dashboardId);
  }

  static filterAllowedUsers<T extends { id: string }>(items: T[]): T[] {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return items.filter((item) => org.users.includes(item.id));
  }

  static filterAllowedWorkers<T extends { id: string }>(items: T[]): T[] {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return items.filter((item) => org.workers.includes(item.id));
  }

  static filterAllowedPlugins<T extends { id: string }>(items: T[]): T[] {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return items.filter((item) => org.plugins.includes(item.id));
  }

  static filterAllowedWorkflows<T extends { id: string }>(items: T[]): T[] {
    const org = OrganizationManager.getInstance().getActiveOrganization();
    return items.filter((item) => org.workflows.includes(item.id));
  }
}
export default OrganizationIsolation;
