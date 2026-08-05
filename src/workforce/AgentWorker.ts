import { WorkerStatus } from './WorkerStatus';
import { WorkerHistoryEntry } from './WorkerHistory';
import { WorkerMemory } from './WorkerMemory';

export interface AgentWorkerConfig {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  permissions: string[];
  tools: string[];
  workflow?: string; // Default workflow ID or name
  status: WorkerStatus;
  capabilities: string[];
  promptTemplate: string;
  suggestedWorkflows: string[];
  rating: number; // Mock rating (e.g. 4.8)
  installed: boolean;
  enabled: boolean;
  tags: string[];
  instructions: string;
  llm: string;
  temperature: number;
  knowledgeBase?: string[];
}

export class AgentWorker {
  public id: string;
  public name: string;
  public description: string;
  public avatar: string;
  public category: string;
  public permissions: string[];
  public tools: string[];
  public workflow?: string;
  public status: WorkerStatus;
  public capabilities: string[];
  public promptTemplate: string;
  public suggestedWorkflows: string[];
  public rating: number;
  public installed: boolean;
  public enabled: boolean;
  public tags: string[];
  public instructions: string;
  public llm: string;
  public temperature: number;
  public knowledgeBase: string[];

  // Sub-modules
  public memory: WorkerMemory;
  public executionHistory: WorkerHistoryEntry[] = [];

  constructor(config: AgentWorkerConfig, executionHistory: WorkerHistoryEntry[] = []) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.avatar = config.avatar;
    this.category = config.category;
    this.permissions = config.permissions;
    this.tools = config.tools;
    this.workflow = config.workflow;
    this.status = config.status;
    this.capabilities = config.capabilities;
    this.promptTemplate = config.promptTemplate;
    this.suggestedWorkflows = config.suggestedWorkflows;
    this.rating = config.rating;
    this.installed = config.installed;
    this.enabled = config.enabled;
    this.tags = config.tags;
    this.instructions = config.instructions;
    this.llm = config.llm;
    this.temperature = config.temperature;
    this.knowledgeBase = config.knowledgeBase || [];

    this.memory = new WorkerMemory(this.id);
    this.executionHistory = executionHistory;
  }

  /**
   * Helper to convert back to raw config object for serialization
   */
  public toJSON(): AgentWorkerConfig {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      avatar: this.avatar,
      category: this.category,
      permissions: this.permissions,
      tools: this.tools,
      workflow: this.workflow,
      status: this.status,
      capabilities: this.capabilities,
      promptTemplate: this.promptTemplate,
      suggestedWorkflows: this.suggestedWorkflows,
      rating: this.rating,
      installed: this.installed,
      enabled: this.enabled,
      tags: this.tags,
      instructions: this.instructions,
      llm: this.llm,
      temperature: this.temperature,
      knowledgeBase: this.knowledgeBase,
    };
  }
}
