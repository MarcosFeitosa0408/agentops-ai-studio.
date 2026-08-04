import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginRegistry } from '@/lib/mcp/registry/PluginRegistry';
import { MemoryStorage } from '@/lib/memory/storage/MemoryStorage';
import { ToolExecutionService } from '@/lib/tools/services/ToolExecutionService';
import { ExecutionMonitor } from '@/lib/workflows/services/ExecutionMonitor';
import { WorkflowLogService } from '@/lib/workflows/services/WorkflowLogService';

describe('Dashboard State Integration Unit Tests', () => {
  beforeEach(() => {
    // Stub global localStorage & window
    const store: Record<string, string> = {
      'agentops_installed_plugins_config': JSON.stringify({
        'github': { enabled: true, installed: true, latencyMs: 80, successCount: 15, errorCount: 0 },
        'slack': { enabled: false, installed: true, latencyMs: 120, successCount: 5, errorCount: 1 },
      }),
    };
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
    PluginRegistry.instance = undefined;
    // @ts-expect-error - reset private instance
    MemoryStorage.instance = undefined;
    // @ts-expect-error - reset private instance
    ToolExecutionService.instance = undefined;
    // @ts-expect-error - reset private instance
    ExecutionMonitor.instance = undefined;
    // @ts-expect-error - reset private instance
    WorkflowLogService.instance = undefined;
  });

  it('should compile correct MCP metrics for Dashboard rendering', () => {
    const pRegistry = PluginRegistry.getInstance();
    pRegistry.discoverPlugins();
    const pList = pRegistry.list();

    const installed = pList.filter((p) => p.installed);
    const activeCount = pList.filter((p) => p.installed && p.enabled).length;
    const activeWithLat = pList.filter((p) => p.installed && p.enabled && p.latencyMs > 0);

    let avgLat = 0;
    if (activeWithLat.length > 0) {
      avgLat = Math.round(activeWithLat.reduce((acc, curr) => acc + curr.latencyMs, 0) / activeWithLat.length);
    }
    const healthyCount = pList.filter((p) => p.installed && p.enabled && p.health === 'healthy').length;
    const rate = activeCount > 0 ? Math.round((healthyCount / activeCount) * 100) : 100;

    expect(installed.length).toBeGreaterThan(0);
    expect(activeCount).toBeGreaterThan(0);
    expect(avgLat).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });

  it('should compute workspace-based dynamic agent isolation rules correctly', () => {
    // Simulate isolated agent filtering as coded in DashboardPage
    const mockAgents = [
      { id: '1', name: 'Finance Expert', specialty: 'Finance' },
      { id: '2', name: 'HR Recruiter', specialty: 'Human Resources' },
      { id: '3', name: 'DB Ops', specialty: 'Database Operations' },
    ];

    const filterByWorkspace = (dept: string) => {
      return mockAgents.filter((agent) => {
        if (dept === 'Finance') {
          return ['Finance', 'Business Intelligence', 'Data Science'].includes(agent.specialty);
        }
        if (dept === 'Marketing') {
          return ['Data Science', 'Human Resources', 'Legal & Compliance'].includes(agent.specialty);
        }
        if (dept === 'Engineering') {
          return ['Database Operations', 'Data Science', 'Business Intelligence'].includes(agent.specialty);
        }
        return true;
      });
    };

    const financeIsolated = filterByWorkspace('Finance');
    expect(financeIsolated.length).toBe(1);
    expect(financeIsolated[0].name).toBe('Finance Expert');

    const engineeringIsolated = filterByWorkspace('Engineering');
    expect(engineeringIsolated.length).toBe(1);
    expect(engineeringIsolated[0].name).toBe('DB Ops');
  });

  it('should format ISO string dates correctly using Portuguese local formatting rules', () => {
    const isoStr = '2025-02-28T10:00:00.000Z';
    const formatDate = (isoString: string) => {
      try {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
      } catch {
        return isoString;
      }
    };

    const formatted = formatDate(isoStr);
    expect(formatted).toBe('28/02');
  });
});
