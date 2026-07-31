import { AgentExecutor, AgentExecutorResult } from '../executor/AgentExecutor';
import { Agent } from '@/types/agent';
import { ExecutionContext } from '../types';

export interface OrchestrationResult {
  results: Record<string, AgentExecutorResult>;
  sharedContext: Record<string, unknown>;
  aggregatedSummary: string;
  history: {
    agentId: string;
    agentName: string;
    request: string;
    response: string;
    timestamp: string;
    latencyMs: number;
    delegatedTo?: string; // delegation tracking
  }[];
  durationMs: number;
}

export interface DelegationStep {
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  task: string;
  response?: string;
  timestamp: string;
}

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private executor: AgentExecutor;
  private activeExecutionsHistory: OrchestrationResult['history'] = [];
  private delegationLogs: DelegationStep[] = [];

  private constructor() {
    this.executor = AgentExecutor.getInstance();
  }

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  /**
   * Safe Agent-to-Agent Delegation.
   * Agent A delegates a specific task to Agent B, retaining shared context.
   */
  public async delegateTask(
    fromAgent: Agent,
    toAgent: Agent,
    task: string,
    context?: ExecutionContext,
  ): Promise<AgentExecutorResult> {
    console.log(`[AgentOrchestrator] Delegation started. "${fromAgent.name}" -> "${toAgent.name}". Task: "${task}"`);

    const logEntry: DelegationStep = {
      fromAgentId: fromAgent.id,
      fromAgentName: fromAgent.name,
      toAgentId: toAgent.id,
      toAgentName: toAgent.name,
      task,
      timestamp: new Date().toISOString(),
    };

    this.delegationLogs.push(logEntry);

    // Run the execution on the target agent using shared context settings
    const runResult = await this.executor.execute(toAgent, task, context);

    // Update log outcome
    logEntry.response = runResult.agentResponse;

    this.activeExecutionsHistory.push({
      agentId: fromAgent.id,
      agentName: fromAgent.name,
      request: `Delegated task to ${toAgent.name}: "${task}"`,
      response: runResult.agentResponse,
      timestamp: new Date().toISOString(),
      latencyMs: runResult.usage.latencyMs,
      delegatedTo: toAgent.name,
    });

    return runResult;
  }

  /**
   * Executes a single agent request.
   */
  public async executeSingle(
    agent: Agent,
    request: string,
    context?: ExecutionContext,
  ): Promise<AgentExecutorResult> {
    const res = await this.executor.execute(agent, request, context);

    this.activeExecutionsHistory.push({
      agentId: agent.id,
      agentName: agent.name,
      request,
      response: res.agentResponse,
      timestamp: new Date().toISOString(),
      latencyMs: res.usage.latencyMs,
    });

    return res;
  }

  /**
   * Executes multiple agents sequentially, sharing the output context as inputs.
   */
  public async executeSequential(
    agents: Agent[],
    initialRequest: string,
    context?: ExecutionContext,
  ): Promise<OrchestrationResult> {
    const start = Date.now();
    const results: Record<string, AgentExecutorResult> = {};
    const sharedContext: Record<string, unknown> = { initialRequest };
    const history: OrchestrationResult['history'] = [];

    let currentRequest = initialRequest;

    for (const agent of agents) {
      // Enrich current agent request with context outputs of previous executions
      const enrichedRequest =
        Object.keys(results).length > 0
          ? `[Shared Sequential Context: ${JSON.stringify(sharedContext)}]\nNext task: ${currentRequest}`
          : currentRequest;

      const runResult = await this.executor.execute(agent, enrichedRequest, context);

      results[agent.id] = runResult;
      sharedContext[`output_${agent.id}`] = runResult.agentResponse;
      currentRequest = `Refining output based on results: ${runResult.agentResponse}`;

      const historyEntry = {
        agentId: agent.id,
        agentName: agent.name,
        request: enrichedRequest,
        response: runResult.agentResponse,
        timestamp: new Date().toISOString(),
        latencyMs: runResult.usage.latencyMs,
      };

      history.push(historyEntry);
      this.activeExecutionsHistory.push(historyEntry);
    }

    const durationMs = Date.now() - start;

    return {
      results,
      sharedContext,
      aggregatedSummary: `Sequentially executed ${agents.length} agent(s). The workflow pipeline shared intermediate execution contexts successfully.`,
      history,
      durationMs,
    };
  }

  /**
   * Executes multiple agents in parallel (mocked concurrency).
   */
  public async executeParallel(
    agents: Agent[],
    request: string,
    context?: ExecutionContext,
  ): Promise<OrchestrationResult> {
    const start = Date.now();
    const results: Record<string, AgentExecutorResult> = {};
    const sharedContext: Record<string, unknown> = { request };
    const history: OrchestrationResult['history'] = [];

    // Trigger executions concurrently
    const promises = agents.map(async (agent) => {
      const runResult = await this.executor.execute(agent, request, context);
      return { agent, runResult };
    });

    const runOutcomes = await Promise.all(promises);

    for (const outcome of runOutcomes) {
      const { agent, runResult } = outcome;
      results[agent.id] = runResult;
      sharedContext[`output_${agent.id}`] = runResult.agentResponse;

      const historyEntry = {
        agentId: agent.id,
        agentName: agent.name,
        request,
        response: runResult.agentResponse,
        timestamp: new Date().toISOString(),
        latencyMs: runResult.usage.latencyMs,
      };

      history.push(historyEntry);
      this.activeExecutionsHistory.push(historyEntry);
    }

    const durationMs = Date.now() - start;

    return {
      results,
      sharedContext,
      aggregatedSummary: `Parallel executed ${agents.length} agent(s) concurrently. Simulated isolated execution lines compiled successfully.`,
      history,
      durationMs,
    };
  }

  /**
   * Return overall multi-agent executions log.
   */
  public getHistory(): OrchestrationResult['history'] {
    return this.activeExecutionsHistory;
  }

  public getDelegationLogs(): DelegationStep[] {
    return this.delegationLogs;
  }

  public clearHistory(): void {
    this.activeExecutionsHistory = [];
    this.delegationLogs = [];
  }
}
export default AgentOrchestrator;
