export interface PlatformMetrics {
  executionCount: number;
  totalLatencyMs: number;
  pluginRuns: Record<string, number>;
  workflowRuns: Record<string, number>;
  memoryUsageBytes: number;
  agentExecutions: Record<string, number>;
  errorCount: number;
  errorsByComponent: Record<string, number>;
  dashboardViews: number;
}

import { OrganizationManager } from '@/organizations/OrganizationManager';

export class MonitoringService {
  private static instance: MonitoringService;
  private STORAGE_KEY = 'agentops_observability_metrics_v1';
  private metrics: PlatformMetrics = this.getInitialMetrics();
  private currentOrgId: string = '';
  private inMemoryMetrics: Record<string, PlatformMetrics> = {};

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getInitialMetrics(): PlatformMetrics {
    return {
      executionCount: 0,
      totalLatencyMs: 0,
      pluginRuns: {},
      workflowRuns: {},
      memoryUsageBytes: 0,
      agentExecutions: {},
      errorCount: 0,
      errorsByComponent: {},
      dashboardViews: 0,
    };
  }

  private hydrate(): void {
    try {
      const activeOrgId = OrganizationManager.getInstance().getActiveOrgId();
      this.currentOrgId = activeOrgId;

      if (!this.isBrowser()) {
        if (!this.inMemoryMetrics[activeOrgId]) {
          this.inMemoryMetrics[activeOrgId] = this.getInitialMetrics();
        }
        this.metrics = this.inMemoryMetrics[activeOrgId];
        return;
      }

      const key = `${this.STORAGE_KEY}_${activeOrgId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.metrics = JSON.parse(stored);
      } else {
        this.metrics = this.getInitialMetrics();
        this.save();
      }
    } catch (err) {
      console.error('[MonitoringService] Hydration failure:', err);
    }
  }

  private ensureHydrated(): void {
    try {
      const activeOrgId = OrganizationManager.getInstance().getActiveOrgId();
      if (activeOrgId !== this.currentOrgId) {
        this.hydrate();
      }
    } catch {
      // fallback
    }
  }

  private save(): void {
    if (!this.isBrowser()) {
      this.inMemoryMetrics[this.currentOrgId] = this.metrics;
      return;
    }
    try {
      const key = `${this.STORAGE_KEY}_${this.currentOrgId}`;
      localStorage.setItem(key, JSON.stringify(this.metrics));
    } catch (err) {
      console.error('[MonitoringService] Save failure:', err);
    }
  }

  public recordExecution(durationMs: number): void {
    this.ensureHydrated();
    this.metrics.executionCount += 1;
    this.metrics.totalLatencyMs += durationMs;
    this.save();
  }

  public recordPluginRun(pluginId: string, durationMs: number): void {
    this.ensureHydrated();
    this.metrics.pluginRuns[pluginId] = (this.metrics.pluginRuns[pluginId] || 0) + 1;
    this.recordExecution(durationMs);
  }

  public recordWorkflowRun(workflowId: string, durationMs: number): void {
    this.ensureHydrated();
    this.metrics.workflowRuns[workflowId] = (this.metrics.workflowRuns[workflowId] || 0) + 1;
    this.recordExecution(durationMs);
  }

  public recordAgentExecution(agentId: string, durationMs: number): void {
    this.ensureHydrated();
    this.metrics.agentExecutions[agentId] = (this.metrics.agentExecutions[agentId] || 0) + 1;
    this.recordExecution(durationMs);
  }

  public recordError(componentName: string): void {
    this.ensureHydrated();
    this.metrics.errorCount += 1;
    this.metrics.errorsByComponent[componentName] = (this.metrics.errorsByComponent[componentName] || 0) + 1;
    this.save();
  }

  public recordDashboardView(): void {
    this.ensureHydrated();
    this.metrics.dashboardViews += 1;
    this.save();
  }

  public updateMemoryBytes(bytes: number): void {
    this.ensureHydrated();
    this.metrics.memoryUsageBytes = bytes;
    this.save();
  }

  public getMetrics(): PlatformMetrics {
    this.ensureHydrated();
    return this.metrics;
  }

  public clearMetrics(): void {
    this.ensureHydrated();
    this.metrics = this.getInitialMetrics();
    this.save();
  }
}

export default MonitoringService;
