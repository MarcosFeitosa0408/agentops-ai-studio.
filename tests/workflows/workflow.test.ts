import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowEngine } from '@/lib/workflows/engine/WorkflowEngine';
import { WorkflowRunner } from '@/lib/workflows/runner/WorkflowRunner';
import { AgentExecutor } from '@/lib/tools/executor/AgentExecutor';
import { ToolExecutionService } from '@/lib/tools/services/ToolExecutionService';
import { Workflow } from '@/lib/workflows/types';

describe('Workflow Engine & Runner Unit Tests', () => {
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
    WorkflowEngine.instance = undefined;
    // @ts-expect-error - reset private instance
    WorkflowRunner.instance = undefined;
    // @ts-expect-error - reset private instance
    AgentExecutor.instance = undefined;
    // @ts-expect-error - reset private instance
    ToolExecutionService.instance = undefined;
  });

  it('should hydrate list of workflows on creation', () => {
    const engine = WorkflowEngine.getInstance();
    const workflows = engine.list();

    expect(workflows.length).toBeGreaterThan(0);
    expect(workflows[0].id).toBe('wf-1');
  });

  it('should support creating, updating and deleting workflows', () => {
    const engine = WorkflowEngine.getInstance();

    const created = engine.create({
      name: 'Custom Flow',
      description: 'Custom description',
      nodes: [],
      edges: [],
      triggers: [],
      variables: [],
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Custom Flow');

    const updated = engine.update(created.id, { name: 'Optimized Flow' });
    expect(updated.name).toBe('Optimized Flow');

    const success = engine.delete(created.id);
    expect(success).toBe(true);
    expect(engine.find(created.id)).toBeUndefined();

    // Test deleting a non-existent workflow
    expect(engine.delete('fake-wf-99')).toBe(false);
  });

  it('should execute workflow nodes and condition branches correctly', async () => {
    const engine = WorkflowEngine.getInstance();

    // Mock tool service to return a specific outcome
    vi.spyOn(ToolExecutionService.prototype, 'executeTool').mockResolvedValue({
      success: true,
      data: 'Output containing SaaS value',
    });

    // Mock agent execution
    vi.spyOn(AgentExecutor.prototype, 'execute').mockResolvedValue({
      agentResponse: 'Agent response generated successfully.',
      stepsExecuted: [],
      reasoningSummary: '',
      citations: [],
      usage: { totalTokens: 10, latencyMs: 50 },
    });

    // Run the default workflow (wf-1)
    const result = await engine.run('wf-1', { thresholdValue: 200 });

    expect(result.status).toBe('completed');
    expect(result.nodeExecutions.length).toBeGreaterThan(0);

    // SQL Node output should contain 'SaaS' which evaluates condition to 'true'
    // 'true' edge target is 'node-agent'. Let's verify 'node-agent' is part of executed nodes.
    const agentNodeExec = result.nodeExecutions.find(n => n.nodeId === 'node-agent');
    expect(agentNodeExec).toBeDefined();
    expect(agentNodeExec?.status).toBe('completed');

    // Node python should NOT be executed because the condition branch evaluated to true
    const pythonNodeExec = result.nodeExecutions.find(n => n.nodeId === 'node-python');
    expect(pythonNodeExec).toBeUndefined();

    // Retrieve executions
    const execs = engine.getExecutions();
    expect(execs.length).toBeGreaterThan(0);

    const wfExecs = engine.getExecutionsByWorkflow('wf-1');
    expect(wfExecs.length).toBeGreaterThan(0);
  });

  it('should handle loop threshold logic preventing infinite cycles', async () => {
    const runner = WorkflowRunner.getInstance();

    // Create a circular workflow
    const circularWorkflow: Workflow = {
      id: 'wf-circular',
      name: 'Looping Test',
      description: 'Loop',
      nodes: [
        { id: 'node-start', name: 'Start', type: 'trigger', position: { x: 0, y: 0 }, config: {} },
        { id: 'node-delay', name: 'Delay', type: 'delay', position: { x: 10, y: 10 }, config: { loopCount: 2 } },
      ],
      edges: [
        { id: 'e1', source: 'node-start', target: 'node-delay' },
        { id: 'e2', source: 'node-delay', target: 'node-delay' }, // circular self link
      ],
      triggers: [],
      variables: [],
      status: 'idle',
      createdAt: '',
      updatedAt: '',
    };

    const result = await runner.execute(circularWorkflow, {});
    expect(result.status).toBe('failed');
    expect(result.error).toContain('Infinite cyclic feedback loop caught');
  });
});
