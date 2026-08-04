import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentExecutor } from '@/lib/tools/executor/AgentExecutor';
import { Agent } from '@/types/agent';
import { ToolExecutionService } from '@/lib/tools/services/ToolExecutionService';
import { AIService } from '@/lib/ai/services/AIService';
import { MemoryService } from '@/lib/memory/services/MemoryService';
import { RetrievalService } from '@/lib/rag/services/RetrievalService';

describe('Agent Executor Unit Tests', () => {
  const mockAgent: Agent = {
    id: 'agent-test-1',
    name: 'Finance Expert',
    description: 'Expert agent',
    specialty: 'Finance',
    status: 'active',
    model: 'gpt-4o',
    temperature: 0.2,
    systemPrompt: 'You are a finance assistant.',
    objective: 'Assist with financial data calculations and audits.',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

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
    AgentExecutor.instance = undefined;
    // @ts-expect-error - reset private instance
    ToolExecutionService.instance = undefined;
    // @ts-expect-error - reset private instance
    AIService.instance = undefined;
    // @ts-expect-error - reset private instance
    MemoryService.instance = undefined;
    // @ts-expect-error - reset private instance
    RetrievalService.instance = undefined;
  });

  it('should plan appropriate tools based on user prompt keywords', () => {
    const executor = AgentExecutor.getInstance();

    // 1. Math trigger
    const plan1 = executor.plan('Calcule 25 * 40');
    expect(plan1.some(step => step.toolId === 'calculator_tool')).toBe(true);

    // 2. Python trigger
    const plan2 = executor.plan('Rode um script python para analisar dados');
    expect(plan2.some(step => step.toolId === 'python_tool')).toBe(true);

    // 3. SQL trigger
    const plan3 = executor.plan('Faça uma query SQL na tabela agents');
    expect(plan3.some(step => step.toolId === 'sql_tool')).toBe(true);

    // 4. Memory/RAG trigger
    const plan4 = executor.plan('Pesquise nos documentos de conhecimento do RAG');
    expect(plan4.some(step => step.toolId === 'rag_tool')).toBe(true);
  });

  it('should fall back to memory scanning if no specific tool is triggered', () => {
    const executor = AgentExecutor.getInstance();
    const plan = executor.plan('Olá, tudo bem?');

    expect(plan.length).toBe(1);
    expect(plan[0].toolId).toBe('memory_tool');
  });

  it('should successfully run execute flow with mocks', async () => {
    const executor = AgentExecutor.getInstance();

    // Spy/Mock services
    const mockChatResult = {
      id: 'chat-response-1',
      message: { id: 'msg-1', role: 'assistant' as const, content: 'Here is the aggregated finance report.', timestamp: '123' },
      usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
      providerId: 'openai' as const,
      modelId: 'gpt-4o',
      latencyMs: 120,
    };

    vi.spyOn(AIService.prototype, 'chat').mockResolvedValue(mockChatResult);
    vi.spyOn(MemoryService.prototype, 'getRelevantContext').mockResolvedValue('Memory info here.');
    vi.spyOn(RetrievalService.prototype, 'getRelevantContext').mockResolvedValue('RAG documents here.');

    const result = await executor.execute(mockAgent, 'Calcule 1500 * 1.25');

    expect(result.agentResponse).toBe('Here is the aggregated finance report.');
    expect(result.stepsExecuted.length).toBe(1);
    expect(result.stepsExecuted[0].step.toolId).toBe('calculator_tool');
    expect(result.usage.totalTokens).toBeGreaterThan(0);
    expect(result.memoryRead).toBeDefined();
    expect(result.ragRead).toBeDefined();
  });
});
