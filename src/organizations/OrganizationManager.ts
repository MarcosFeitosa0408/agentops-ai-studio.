import { Organization } from './Organization';
import { OrganizationRepository } from './OrganizationRepository';

export class OrganizationManager {
  private static instance: OrganizationManager;
  private ACTIVE_ORG_KEY = 'agentops_active_org_id_v1';
  private activeOrgId: string = 'org-default';

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): OrganizationManager {
    if (!OrganizationManager.instance) {
      OrganizationManager.instance = new OrganizationManager();
    }
    return OrganizationManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private hydrate(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.ACTIVE_ORG_KEY);
      if (stored) {
        this.activeOrgId = stored;
      } else {
        this.activeOrgId = 'org-default';
        localStorage.setItem(this.ACTIVE_ORG_KEY, 'org-default');
      }
    } catch (e) {
      console.error('Error hydrating active org ID:', e);
    }
  }

  public getActiveOrgId(): string {
    try {
      this.getActiveOrganization();
    } catch {
      // ignore
    }
    return this.activeOrgId;
  }

  public getActiveOrganization(): Organization {
    const orgs = OrganizationRepository.list();
    const active = orgs.find((o) => o.id === this.activeOrgId);
    if (active) return active;

    const fallback = orgs.find((o) => o.id === 'org-default') || orgs[0];
    if (fallback) {
      this.activeOrgId = fallback.id;
      if (this.isBrowser()) {
        localStorage.setItem(this.ACTIVE_ORG_KEY, fallback.id);
      }
      return fallback;
    }
    throw new Error('No organizations found');
  }

  public switchOrganization(id: string): void {
    const org = OrganizationRepository.find(id);
    if (!org) {
      throw new Error(`Organization ${id} does not exist`);
    }
    if (org.status !== 'active') {
      throw new Error(`Organization ${org.name} is deactivated`);
    }
    this.activeOrgId = id;
    if (this.isBrowser()) {
      localStorage.setItem(this.ACTIVE_ORG_KEY, id);
    }
  }

  // --- Limit Validation API ---

  public canAddUser(): boolean {
    const org = this.getActiveOrganization();
    return org.users.length < org.limits.maxUsers;
  }

  public canAddWorker(): boolean {
    const org = this.getActiveOrganization();
    return org.workers.length < org.limits.maxWorkers;
  }

  public canAddPlugin(): boolean {
    const org = this.getActiveOrganization();
    return org.plugins.length < org.limits.maxPlugins;
  }

  public canAddWorkflow(): boolean {
    const org = this.getActiveOrganization();
    return org.workflows.length < org.limits.maxWorkflows;
  }

  public canAddDashboard(): boolean {
    const org = this.getActiveOrganization();
    return org.dashboards.length < org.limits.maxDashboards;
  }

  public canUseMemory(currentBytes: number, bytesToAdd: number): boolean {
    const org = this.getActiveOrganization();
    return currentBytes + bytesToAdd <= org.limits.maxMemoryUsageBytes;
  }

  // --- Resource Association API ---

  public associateUser(userId: string): void {
    const org = this.getActiveOrganization();
    if (!org.users.includes(userId)) {
      if (!this.canAddUser()) {
        throw new Error(`Plan limit reached: Maximum users allowed is ${org.limits.maxUsers}`);
      }
      const updatedUsers = [...org.users, userId];
      OrganizationRepository.update(org.id, { users: updatedUsers });
    }
  }

  public associateWorker(workerId: string): void {
    const org = this.getActiveOrganization();
    if (!org.workers.includes(workerId)) {
      if (!this.canAddWorker()) {
        throw new Error(`Plan limit reached: Maximum workers allowed is ${org.limits.maxWorkers}`);
      }
      const updatedWorkers = [...org.workers, workerId];
      OrganizationRepository.update(org.id, { workers: updatedWorkers });
    }
  }

  public associatePlugin(pluginId: string): void {
    const org = this.getActiveOrganization();
    if (!org.plugins.includes(pluginId)) {
      if (!this.canAddPlugin()) {
        throw new Error(`Plan limit reached: Maximum plugins allowed is ${org.limits.maxPlugins}`);
      }
      const updatedPlugins = [...org.plugins, pluginId];
      OrganizationRepository.update(org.id, { plugins: updatedPlugins });
    }
  }

  public associateWorkflow(workflowId: string): void {
    const org = this.getActiveOrganization();
    if (!org.workflows.includes(workflowId)) {
      if (!this.canAddWorkflow()) {
        throw new Error(`Plan limit reached: Maximum workflows allowed is ${org.limits.maxWorkflows}`);
      }
      const updatedWorkflows = [...org.workflows, workflowId];
      OrganizationRepository.update(org.id, { workflows: updatedWorkflows });
    }
  }

  public associateDashboard(dashboardId: string): void {
    const org = this.getActiveOrganization();
    if (!org.dashboards.includes(dashboardId)) {
      if (!this.canAddDashboard()) {
        throw new Error(`Plan limit reached: Maximum dashboards allowed is ${org.limits.maxDashboards}`);
      }
      const updatedDashboards = [...org.dashboards, dashboardId];
      OrganizationRepository.update(org.id, { dashboards: updatedDashboards });
    }
  }
}
export default OrganizationManager;
