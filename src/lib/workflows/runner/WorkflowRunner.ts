import { Workflow, WorkflowExecution, WorkflowNodeExecution, WorkflowCondition, WorkflowNode } from '../types';
import { AgentExecutor } from '../../tools/executor/AgentExecutor';
import { ToolExecutionService } from '../../tools/services/ToolExecutionService';
import { INITIAL_MOCK_AGENTS } from '@/context/AgentContext';

export class WorkflowRunner {
  private static instance: WorkflowRunner;
  private agentExecutor: AgentExecutor;
  private toolExecutionService: ToolExecutionService;

  private constructor() {
    this.agentExecutor = AgentExecutor.getInstance();
    this.toolExecutionService = ToolExecutionService.getInstance();
  }

  public static getInstance(): WorkflowRunner {
    if (!WorkflowRunner.instance) {
      WorkflowRunner.instance = new WorkflowRunner();
    }
    return WorkflowRunner.instance;
  }

  /**
   * Evaluates standard workflow condition against current execution variables.
   */
  private evaluateCondition(cond: WorkflowCondition, variables: Record<string, unknown>): boolean {
    const val = variables[cond.variableName];
    if (val === undefined) return false;

    const target = cond.value;

    switch (cond.operator) {
      case 'equals':
        return String(val) === String(target);
      case 'not_equals':
        return String(val) !== String(target);
      case 'greater_than':
        return Number(val) > Number(target);
      case 'less_than':
        return Number(val) < Number(target);
      case 'contains':
        return String(val).toLowerCase().includes(String(target).toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Executes a single workflow from its triggers/start node to final end state.
   */
  public async execute(
    workflow: Workflow,
    initialVariables: Record<string, unknown>,
    onStateChange?: (exec: WorkflowExecution) => void,
  ): Promise<WorkflowExecution> {
    const start = Date.now();
    const execId = `exec-${Math.random().toString(36).substring(2, 9)}`;

    const execution: WorkflowExecution = {
      id: execId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startedAt: new Date().toISOString(),
      variables: { ...initialVariables },
      nodeExecutions: [],
      triggerType: 'manual',
    };

    onStateChange?.(execution);

    try {
      // Find trigger/start node
      let currentNode: WorkflowNode | null | undefined =
        workflow.nodes.find((n) => n.type === 'trigger') || workflow.nodes[0];
      const visited = new Set<string>();
      const executionPath: string[] = [];

      while (currentNode && execution.status === 'running') {
        const nodeStart = Date.now();
        const nodeExec: WorkflowNodeExecution = {
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          status: 'running',
          startedAt: new Date().toISOString(),
          input: { ...execution.variables, ...currentNode.config.toolInput as Record<string, unknown> },
        };

        execution.nodeExecutions.push(nodeExec);
        execution.currentElementId = currentNode.id;
        onStateChange?.(execution);
        executionPath.push(currentNode.id);

        // Circular loop preventer
        if (visited.has(currentNode.id)) {
          // Simulated loops can increment indices, but infinite cycles throw errors
          const loopCount = currentNode.config.loopCount as number || 3;
          const currentLoopRuns = execution.nodeExecutions.filter((x) => x.nodeId === currentNode!.id).length;
          if (currentLoopRuns > loopCount) {
            throw new Error(`Infinite cyclic feedback loop caught on Node: ${currentNode.name}`);
          }
        }
        visited.add(currentNode.id);

        // Execution of individual node types
        try {
          if (currentNode.type === 'delay') {
            const ms = (currentNode.config.delayMs as number) || 200;
            await new Promise((resolve) => setTimeout(resolve, ms));
            nodeExec.output = { message: `Completed wait of ${ms}ms.` };
          } else if (currentNode.type === 'agent') {
            // Find active agent details
            const agentId = currentNode.config.agentId;
            const targetAgent = INITIAL_MOCK_AGENTS.find((a) => a.id === agentId) || INITIAL_MOCK_AGENTS[0];
            const textPrompt = `Running automated workflow node step. Target instruction context: ${JSON.stringify(currentNode.config)}`;

            const agentRes = await this.agentExecutor.execute(targetAgent, textPrompt, {
              agentId: targetAgent.id,
              memoryEnabled: true,
              ragEnabled: true,
              variables: execution.variables,
            });

            nodeExec.output = agentRes.agentResponse;
            // Write variables
            execution.variables[`output_${currentNode.id}`] = agentRes.agentResponse;
            execution.variables.lastAgentOutput = agentRes.agentResponse;
          } else if (currentNode.type === 'tool') {
            const toolId = currentNode.config.toolId || 'calculator_tool';
            const inputs = (currentNode.config.toolInput as Record<string, unknown>) || { expression: '100 * 5' };

            const toolRes = await this.toolExecutionService.executeTool(toolId, inputs, {
              variables: execution.variables,
              memoryEnabled: false,
              ragEnabled: false,
            });

            if (!toolRes.success) {
              throw new Error(toolRes.error || `Tool ${toolId} returned failed code.`);
            }

            nodeExec.output = toolRes.data;
            execution.variables[`output_${currentNode.id}`] = toolRes.data;
            execution.variables.lastToolOutput = toolRes.data;
          } else if (currentNode.type === 'condition' && currentNode.config.condition) {
            const pass = this.evaluateCondition(currentNode.config.condition, execution.variables);
            nodeExec.output = { evaluatedResult: pass };
            execution.variables[`pass_${currentNode.id}`] = pass;
          } else {
            nodeExec.output = { message: 'Processed trigger node.' };
          }

          nodeExec.status = 'completed';
          nodeExec.completedAt = new Date().toISOString();
          nodeExec.durationMs = Date.now() - nodeStart;
        } catch (err: unknown) {
          nodeExec.status = 'failed';
          nodeExec.completedAt = new Date().toISOString();
          nodeExec.durationMs = Date.now() - nodeStart;
          const errMsg = err instanceof Error ? err.message : String(err);
          nodeExec.error = errMsg;
          throw err;
        }

        // Move to the next node based on edges
        const outgoingEdges = workflow.edges.filter((e) => e.source === currentNode!.id);

        if (currentNode.type === 'condition') {
          const pass = execution.variables[`pass_${currentNode.id}`] as boolean;
          const decisionVal = pass ? 'true' : 'false';
          const matchedEdge = outgoingEdges.find((e) => e.conditionValue === decisionVal) || outgoingEdges[0];
          currentNode = matchedEdge ? workflow.nodes.find((n) => n.id === matchedEdge.target) || null : null;
        } else {
          currentNode = outgoingEdges.length > 0 ? workflow.nodes.find((n) => n.id === outgoingEdges[0].target) || null : null;
        }
      }

      execution.status = 'completed';
    } catch (err: unknown) {
      execution.status = 'failed';
      const errMsg = err instanceof Error ? err.message : String(err);
      execution.error = errMsg;
    } finally {
      execution.completedAt = new Date().toISOString();
      execution.durationMs = Date.now() - start;
      execution.currentElementId = undefined;
      onStateChange?.(execution);
    }

    return execution;
  }
}
export default WorkflowRunner;
