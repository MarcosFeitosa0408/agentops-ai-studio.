import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentOrchestrator } from '@/lib/tools/orchestrator/AgentOrchestrator';
import { AgentExecutor } from '@/lib/tools/executor/AgentExecutor';
import { Agent } from '@/types/agent';

describe('Agent Orchestrator Unit Tests', () => {
  const agent1: Agent = {
    id: 'agent-1',
    name: 'Research Agent',
    specialty: 'Research',
    status: 'active',
    model: 'gpt-4o',
    temperature: 0.2,
    systemPrompt: '',
    objective: 'Do research',
    createdAt: '',
    updatedAt: '',
    description: '',
  };

  const agent2: Agent = {
    id: 'agent-2',
    name: 'Scribe Agent',
    specialty: 'Writing',
    status: 'active',
    model: 'gpt-4o',
    temperature: 0.5,
    systemPrompt: '',
    objective: 'Write summaries',
    createdAt: '',
    updatedAt: '',
    description: '',
  };

  beforeEach(() => {
    // Reset singletons
    // @ts-expect-error - reset private instance
    AgentOrchestrator.instance = undefined;
    // @ts-expect-error - reset private instance
    AgentExecutor.instance = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should support task delegation between two agents', async () => {
    const orchestrator = AgentOrchestrator.getInstance();

    const mockExecutorResult = {
      agentResponse: 'Delegated task output text.',
      stepsExecuted: [],
      reasoningSummary: 'No tools needed.',
      citations: [],
      usage: { totalTokens: 100, latencyMs: 200 },
    };

    vi.spyOn(AgentExecutor.prototype, 'execute').mockResolvedValue(mockExecutorResult);

    const result = await orchestrator.delegateTask(agent1, agent2, 'Summarize research findings');
    expect(result.agentResponse).toBe('Delegated task output text.');

    const delegationLogs = orchestrator.getDelegationLogs();
    expect(delegationLogs.length).toBe(1);
    expect(delegationLogs[0].fromAgentId).toBe(agent1.id);
    expect(delegationLogs[0].toAgentId).toBe(agent2.id);
    expect(delegationLogs[0].task).toBe('Summarize research findings');
    expect(delegationLogs[0].response).toBe('Delegated task output text.');
  });

  it('should run executeSingle and record in history log', async () => {
    const orchestrator = AgentOrchestrator.getInstance();

    const mockResult = {
      agentResponse: 'Single execution completed.',
      stepsExecuted: [],
      reasoningSummary: '',
      citations: [],
      usage: { totalTokens: 50, latencyMs: 100 },
    };

    vi.spyOn(AgentExecutor.prototype, 'execute').mockResolvedValue(mockResult);

    const result = await orchestrator.executeSingle(agent1, 'Hello agent');
    expect(result.agentResponse).toBe('Single execution completed.');

    const history = orchestrator.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].agentId).toBe(agent1.id);
    expect(history[0].request).toBe('Hello agent');
    expect(history[0].response).toBe('Single execution completed.');
  });

  it('should run sequential execution compiling shared context', async () => {
    const orchestrator = AgentOrchestrator.getInstance();

    let execCount = 0;
    vi.spyOn(AgentExecutor.prototype, 'execute').mockImplementation(async (agent) => {
      execCount++;
      return {
        agentResponse: `Response from ${agent.name} for run #${execCount}`,
        stepsExecuted: [],
        reasoningSummary: '',
        citations: [],
        usage: { totalTokens: 10 * execCount, latencyMs: 50 },
      };
    });

    const result = await orchestrator.executeSequential([agent1, agent2], 'Initial prompt content');

    expect(result.aggregatedSummary).toContain('Sequentially executed 2 agent(s)');
    expect(result.results[agent1.id].agentResponse).toBe('Response from Research Agent for run #1');
    expect(result.results[agent2.id].agentResponse).toBe('Response from Scribe Agent for run #2');
    expect(result.sharedContext[`output_${agent1.id}`]).toBe('Response from Research Agent for run #1');
    expect(result.sharedContext[`output_${agent2.id}`]).toBe('Response from Scribe Agent for run #2');
  });

  it('should run parallel execution compiling results concurrently', async () => {
    const orchestrator = AgentOrchestrator.getInstance();

    vi.spyOn(AgentExecutor.prototype, 'execute').mockImplementation(async (agent) => {
      return {
        agentResponse: `Concurrently done by ${agent.name}`,
        stepsExecuted: [],
        reasoningSummary: '',
        citations: [],
        usage: { totalTokens: 30, latencyMs: 40 },
      };
    });

    const result = await orchestrator.executeParallel([agent1, agent2], 'Parallel question');

    expect(result.aggregatedSummary).toContain('Parallel executed 2 agent(s)');
    expect(result.results[agent1.id].agentResponse).toBe('Concurrently done by Research Agent');
    expect(result.results[agent2.id].agentResponse).toBe('Concurrently done by Scribe Agent');
  });
});
