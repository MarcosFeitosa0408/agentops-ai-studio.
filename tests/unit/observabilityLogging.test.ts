import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonitoringService } from '@/lib/observability/MonitoringService';
import { StandardizedLoggingService } from '@/lib/logging/StandardizedLoggingService';

describe('Observability & Standardized Logging Service Tests', () => {
  beforeEach(() => {
    // Stub global localStorage & window
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => '',
    };
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', mockLocalStorage);

    // Reset singletons
    // @ts-expect-error - reset private instance
    MonitoringService.instance = undefined;
    // @ts-expect-error - reset private instance
    StandardizedLoggingService.instance = undefined;
  });

  it('should initialize and record metrics in MonitoringService correctly', () => {
    const service = MonitoringService.getInstance();

    service.recordAgentExecution('agent-1', 120);
    service.recordPluginRun('plugin-github', 80);
    service.recordWorkflowRun('workflow-1', 450);
    service.recordError('RAG');
    service.recordDashboardView();
    service.updateMemoryBytes(2048);

    const metrics = service.getMetrics();
    expect(metrics.executionCount).toBe(3);
    expect(metrics.totalLatencyMs).toBe(120 + 80 + 450);
    expect(metrics.agentExecutions['agent-1']).toBe(1);
    expect(metrics.pluginRuns['plugin-github']).toBe(1);
    expect(metrics.workflowRuns['workflow-1']).toBe(1);
    expect(metrics.errorCount).toBe(1);
    expect(metrics.errorsByComponent['RAG']).toBe(1);
    expect(metrics.dashboardViews).toBe(1);
    expect(metrics.memoryUsageBytes).toBe(2048);
  });

  it('should initialize and write standardized logs in StandardizedLoggingService correctly', () => {
    const service = StandardizedLoggingService.getInstance();

    const addedLog = service.log({
      workspace: 'ws-eng',
      user: 'user-1',
      agent: 'agent-1',
      plugin: 'N/A',
      workflow: 'wf-1',
      duration: 150,
      result: 'Success message output',
      error: null,
      severity: 'info',
    });

    expect(addedLog.id).toBeDefined();
    expect(addedLog.timestamp).toBeDefined();
    expect(addedLog.workspace).toBe('ws-eng');

    const list = service.list();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(addedLog.id);

    const wsLogs = service.getByWorkspace('ws-eng');
    expect(wsLogs.length).toBe(1);
  });
});
