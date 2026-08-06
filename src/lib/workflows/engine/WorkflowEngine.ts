import { Workflow, WorkflowExecution } from '../types';
import { WorkflowRunner } from '../runner/WorkflowRunner';
import { WorkflowLogService } from '../services/WorkflowLogService';
import { OrganizationIsolation } from '@/organizations/OrganizationIsolation';
import { OrganizationManager } from '@/organizations/OrganizationManager';

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private STORAGE_KEY = 'agentops_workflows_v1';
  private EXEC_KEY = 'agentops_workflow_executions_v1';
  private runner: WorkflowRunner;
  private logService: WorkflowLogService;

  private workflows: Workflow[] = [];
  private executions: WorkflowExecution[] = [];

  private constructor() {
    this.runner = WorkflowRunner.getInstance();
    this.logService = WorkflowLogService.getInstance();
    this.hydrate();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  private hydrate(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.workflows = JSON.parse(stored);
      } else {
        this.workflows = this.getMockWorkflows();
        this.save();
      }

      const storedExecs = localStorage.getItem(this.EXEC_KEY);
      if (storedExecs) {
        this.executions = JSON.parse(storedExecs);
      } else {
        this.executions = [];
      }
    } catch (err) {
      console.error('[WorkflowEngine] Hydration error:', err);
      this.workflows = this.getMockWorkflows();
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.workflows));
      localStorage.setItem(this.EXEC_KEY, JSON.stringify(this.executions));
    } catch (err) {
      console.error('[WorkflowEngine] Save failure:', err);
    }
  }

  private getMockWorkflows(): Workflow[] {
    return [
      {
        id: 'wf-1',
        name: 'Análise de Vendas Automatizada',
        description: 'Coleta consultas SQL estruturadas, formata dados e dispara o executor Python para relatórios executivos.',
        nodes: [
          {
            id: 'node-start',
            name: 'Manual Start',
            type: 'trigger',
            position: { x: 50, y: 150 },
            config: {},
          },
          {
            id: 'node-sql',
            name: 'Relatório de Clientes SQL',
            type: 'tool',
            position: { x: 250, y: 150 },
            config: {
              toolId: 'sql_tool',
              toolInput: { query: 'SELECT name, age, city FROM customers LIMIT 10' },
            },
          },
          {
            id: 'node-condition',
            name: 'Query Validade?',
            type: 'condition',
            position: { x: 450, y: 150 },
            config: {
              condition: {
                id: 'cond-1',
                variableName: 'output_node-sql',
                operator: 'contains',
                value: 'SaaS',
              },
            },
          },
          {
            id: 'node-agent',
            name: 'Engenheiro de Analytics',
            type: 'agent',
            position: { x: 700, y: 50 },
            config: {
              agentId: 'agent-1',
            },
          },
          {
            id: 'node-python',
            name: 'Python Sandbox Regression',
            type: 'tool',
            position: { x: 700, y: 250 },
            config: {
              toolId: 'python_tool',
              toolInput: { code: 'df.describe()' },
            },
          },
        ],
        edges: [
          { id: 'edge-1', source: 'node-start', target: 'node-sql' },
          { id: 'edge-2', source: 'node-sql', target: 'node-condition' },
          { id: 'edge-3', source: 'node-condition', target: 'node-agent', conditionValue: 'true' },
          { id: 'edge-4', source: 'node-condition', target: 'node-python', conditionValue: 'false' },
        ],
        triggers: [
          { id: 'trig-1', type: 'manual', config: {}, enabled: true },
        ],
        variables: [
          { name: 'thresholdValue', type: 'number', value: 100 },
        ],
        status: 'idle',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  public list(): Workflow[] {
    this.hydrate();
    try {
      return this.workflows.filter((w) => OrganizationIsolation.isWorkflowAllowed(w.id));
    } catch {
      return this.workflows;
    }
  }

  public find(id: string): Workflow | undefined {
    this.hydrate();
    try {
      if (!OrganizationIsolation.isWorkflowAllowed(id)) {
        return undefined;
      }
    } catch {
      // ignore
    }
    return this.workflows.find((w) => w.id === id);
  }

  public create(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Workflow {
    const timestamp = new Date().toISOString();
    const newWorkflow: Workflow = {
      ...workflow,
      id: `wf-${Math.random().toString(36).substring(2, 9)}`,
      status: 'idle',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.workflows.unshift(newWorkflow);
    this.save();

    try {
      OrganizationManager.getInstance().associateWorkflow(newWorkflow.id);
    } catch (e) {
      console.error('Error associating custom workflow with organization:', e);
    }

    return newWorkflow;
  }

  public update(id: string, updates: Partial<Workflow>): Workflow {
    this.workflows = this.workflows.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });
    this.save();
    const updated = this.find(id);
    if (!updated) throw new Error('Workflow not found after update.');
    return updated;
  }

  public delete(id: string): boolean {
    const originalLen = this.workflows.length;
    this.workflows = this.workflows.filter((w) => w.id !== id);
    this.save();
    return this.workflows.length < originalLen;
  }

  public async run(id: string, variables: Record<string, unknown> = {}): Promise<WorkflowExecution> {
    const wf = this.find(id);
    if (!wf) throw new Error(`Workflow '${id}' does not exist.`);

    this.update(id, { status: 'running' });

    try {
      const result = await this.runner.execute(wf, variables, (progress) => {
        // Real-time listener update
        this.executions = this.executions.filter((e) => e.id !== progress.id);
        this.executions.unshift(progress);
        if (this.executions.length > 50) {
          this.executions = this.executions.slice(0, 50);
        }
        this.save();
      });

      // Update original workflow status
      this.update(id, { status: result.status });

      // Log persistence
      this.logService.log({
        workflowId: wf.id,
        executionId: result.id,
        status: result.status,
        durationMs: result.durationMs || 0,
        timestamp: new Date().toISOString(),
        input: variables,
        output: result.variables,
        executionPath: result.nodeExecutions.map((n) => n.nodeId),
      });

      return result;
    } catch (err: unknown) {
      this.update(id, { status: 'failed' });
      throw err;
    }
  }

  public getExecutions(): WorkflowExecution[] {
    this.hydrate();
    try {
      return this.executions.filter((e) => OrganizationIsolation.isWorkflowAllowed(e.workflowId));
    } catch {
      return this.executions;
    }
  }

  public getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    this.hydrate();
    return this.executions.filter((e) => e.workflowId === workflowId);
  }
}
export default WorkflowEngine;
