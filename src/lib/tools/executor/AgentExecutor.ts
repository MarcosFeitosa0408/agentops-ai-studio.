import { ToolExecutionService } from '../services/ToolExecutionService';
import { AIService } from '../../ai/services/AIService';
import { MemoryService } from '../../memory/services/MemoryService';
import { RetrievalService } from '../../rag/services/RetrievalService';
import { Agent } from '@/types/agent';
import { ChatRequest } from '../../ai/types';
import { ToolResult, ExecutionContext } from '../types';

export interface PlanStep {
  toolId: string;
  reason: string;
  input: Record<string, unknown>;
}

export interface AgentExecutorResult {
  agentResponse: string;
  stepsExecuted: {
    step: PlanStep;
    result: ToolResult;
  }[];
  reasoningSummary: string;
  citations: string[];
  usage: {
    totalTokens: number;
    latencyMs: number;
  };
  memoryRead?: string;
  ragRead?: string;
}

interface ChunkMeta {
  documentName: string;
  pageNumber?: number;
}

export class AgentExecutor {
  private static instance: AgentExecutor;
  private toolService: ToolExecutionService;
  private aiService: AIService;
  private memoryService: MemoryService;
  private retrievalService: RetrievalService;

  private constructor() {
    this.toolService = ToolExecutionService.getInstance();
    this.aiService = AIService.getInstance();
    this.memoryService = MemoryService.getInstance();
    this.retrievalService = RetrievalService.getInstance();
  }

  public static getInstance(): AgentExecutor {
    if (!AgentExecutor.instance) {
      AgentExecutor.instance = new AgentExecutor();
    }
    return AgentExecutor.instance;
  }

  /**
   * Safe, deterministic rule-based tool planning depending on prompt keywords.
   */
  public plan(request: string): PlanStep[] {
    const text = request.toLowerCase();
    const steps: PlanStep[] = [];

    // Rule-based heuristic matchers
    if (text.includes('calc') || text.includes('math') || text.includes('somar') || text.includes('calcular') || /[\d+\-*/()]{3,}/.test(request)) {
      // Find math expressions
      const match = request.match(/[\d+\-*/().\s]{3,}/);
      const expression = match ? match[0].trim() : '100 + 200';
      steps.push({
        toolId: 'calculator_tool',
        reason: 'Mathematical formula detected in input request.',
        input: { expression },
      });
    }

    if (text.includes('python') || text.includes('dataframe') || text.includes('script') || text.includes('grafico') || text.includes('analisar')) {
      steps.push({
        toolId: 'python_tool',
        reason: 'Requested computational data frame script execution.',
        input: { code: 'df.describe()' },
      });
    }

    if (text.includes('sql') || text.includes('query') || text.includes('tabela') || text.includes('select')) {
      steps.push({
        toolId: 'sql_tool',
        reason: 'Requires relational database tabular records.',
        input: { query: "SELECT * FROM agents WHERE status = 'active'" },
      });
    }

    if (text.includes('api') || text.includes('endpoint') || text.includes('http') || text.includes('get ') || text.includes('post ')) {
      steps.push({
        toolId: 'rest_api_tool',
        reason: 'Remote microservice sync required.',
        input: { url: 'https://api.agentops.ai/v1/status', method: 'GET' },
      });
    }

    if (text.includes('excel') || text.includes('planilha') || text.includes('xlsx')) {
      steps.push({
        toolId: 'excel_tool',
        reason: 'Financial spreadsheets calculations mapping.',
        input: { workbookPath: 'project_revenues.xlsx', range: 'Sheet1!A1:D10' },
      });
    }

    if (text.includes('csv') || text.includes('arquivo csv')) {
      steps.push({
        toolId: 'csv_tool',
        reason: 'Structured CSV observations loading required.',
        input: { filepath: 'agents_schedules.csv' },
      });
    }

    if (text.includes('memoria') || text.includes('lembra') || text.includes('fatos')) {
      steps.push({
        toolId: 'memory_tool',
        reason: 'Local Memory store cognitive retrieval.',
        input: { query: request, limit: 3 },
      });
    }

    if (text.includes('documento') || text.includes('conhecimento') || text.includes('rag') || text.includes('pdf') || text.includes('base')) {
      steps.push({
        toolId: 'rag_tool',
        reason: 'RAG semantic knowledge document matching.',
        input: { query: request, limit: 2 },
      });
    }

    if (text.includes('web') || text.includes('google') || text.includes('busca') || text.includes('noticia') || text.includes('notícias')) {
      steps.push({
        toolId: 'web_search_tool',
        reason: 'Real-time internet web results collection.',
        input: { query: request },
      });
    }

    // Default cognitive fallback if no specific tool is triggered
    if (steps.length === 0 && text.trim().length > 0) {
      steps.push({
        toolId: 'memory_tool',
        reason: 'Scanning long-term context prior to synthesis.',
        input: { query: request, limit: 1 },
      });
    }

    return steps;
  }

  /**
   * Full execution lifecycle: Memory lookup, RAG, Plan, Execute, Send to AI Gateway.
   */
  public async execute(
    agent: Agent,
    request: string,
    context?: ExecutionContext,
  ): Promise<AgentExecutorResult> {
    const start = Date.now();

    // 1. Consult Memory
    let memoryContext = '';
    if (context?.memoryEnabled !== false) {
      memoryContext = await this.memoryService.getRelevantContext(request, { agentId: agent.id });
    }

    // 2. Consult RAG
    let ragContext = '';
    if (context?.ragEnabled !== false) {
      ragContext = await this.retrievalService.getRelevantContext(request, undefined, 2);
    }

    // 3. Plan required tools
    const planSteps = this.plan(request);

    // 4. Execute planning steps
    const stepsExecuted: { step: PlanStep; result: ToolResult }[] = [];
    for (const step of planSteps) {
      const res = await this.toolService.executeTool(step.toolId, step.input, {
        variables: {},
        memoryEnabled: true,
        ragEnabled: true,
        ...context,
        agentId: agent.id,
      });
      stepsExecuted.push({ step, result: res });
    }

    // 5. Gather result values for the LLM prompt block
    const toolsContextLines: string[] = [];
    const citations: string[] = [];

    stepsExecuted.forEach(({ step, result }, idx) => {
      const toolInstance = this.toolService.getRegistry().find(step.toolId);
      const name = toolInstance ? toolInstance.name : step.toolId;

      if (result.success) {
        toolsContextLines.push(
          `[Tool Run #${idx + 1}] Used: "${name}". Reason: "${step.reason}". Input: ${JSON.stringify(step.input)}. Output Result: ${JSON.stringify(result.data)}`,
        );
        if (step.toolId === 'rag_tool' && result.data) {
          const typedData = result.data as { chunks?: ChunkMeta[] };
          if (typedData.chunks) {
            typedData.chunks.forEach((c) => {
              citations.push(`${c.documentName} (pág. ${c.pageNumber || 1})`);
            });
          }
        }
      } else {
        toolsContextLines.push(
          `[Tool Run #${idx + 1} FAILED] Used: "${name}". Input: ${JSON.stringify(step.input)}. Error Details: "${result.error}"`,
        );
      }
    });

    const toolsContextBlock =
      toolsContextLines.length > 0
        ? `\n--- TOOL ENGINE RUNS RESULT DATA ---\n${toolsContextLines.join('\n')}\n-----------------------------------\n`
        : '';

    // 6. Build final system prompt integrating agent context, memories, rag docs and tools outcome
    const enrichedUserContent = `User Request: "${request}"\n${memoryContext}${ragContext}${toolsContextBlock}\nPlease synthesize a complete and highly helpful final output response as the agent "${agent.name}" (${agent.specialty}) fulfilling the request above.`;

    const chatRequest: ChatRequest = {
      providerId: 'openai', // Default routes using openai simulator
      modelId: agent.model,
      messages: [
        { id: 'sys-prompt', role: 'system', content: agent.systemPrompt, timestamp: new Date().toISOString() },
        { id: 'user-enriched', role: 'user', content: enrichedUserContent, timestamp: new Date().toISOString() },
      ],
      settings: {
        temperature: agent.temperature,
        maxTokens: 2048,
      },
    };

    const aiResponse = await this.aiService.chat(chatRequest);

    // Latency compile
    const duration = Date.now() - start;

    const totalSteps = stepsExecuted.length;
    const successfulSteps = stepsExecuted.filter((s) => s.result.success).length;

    const reasoningSummary = `I planned ${totalSteps} tool execution action(s) based on your request. Successfully resolved ${successfulSteps} step(s) containing computational formulas and external databases before passing final aggregated outputs through AIService.`;

    return {
      agentResponse: aiResponse.message.content,
      stepsExecuted,
      reasoningSummary,
      citations: Array.from(new Set(citations)),
      usage: {
        totalTokens: aiResponse.usage.totalTokens + Math.floor(duration * 0.08),
        latencyMs: duration,
      },
      memoryRead: memoryContext ? 'Memory contextual block loaded' : undefined,
      ragRead: ragContext ? 'RAG database scanned' : undefined,
    };
  }
}
export default AgentExecutor;
