export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type TriggerType = 'manual' | 'scheduled' | 'webhook' | 'file_upload' | 'api_request' | 'database_event';

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface WorkflowCondition {
  id: string;
  variableName: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: unknown;
  description?: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'agent' | 'tool' | 'condition' | 'trigger' | 'delay' | 'loop' | 'end';
  config: {
    agentId?: string;
    toolId?: string;
    toolInput?: Record<string, unknown>;
    condition?: WorkflowCondition;
    delayMs?: number;
    loopCount?: number;
    targetNodeId?: string; // for loops/delay
    [key: string]: unknown;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  conditionValue?: 'true' | 'false' | string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: WorkflowTrigger[];
  variables: WorkflowVariable[];
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNodeExecution {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  variables: Record<string, unknown>;
  nodeExecutions: WorkflowNodeExecution[];
  currentElementId?: string;
  triggerType: TriggerType;
  error?: string;
}

export interface WorkflowHistory {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  timestamp: string;
  durationMs: number;
  triggerType: TriggerType;
}

export interface WorkflowStatistics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successCount: number;
  failedCount: number;
  successRate: number; // percentage
  averageDurationMs: number;
}

export interface WorkflowLog {
  id: string;
  workflowId: string;
  executionId: string;
  status: WorkflowStatus;
  durationMs: number;
  timestamp: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  executionPath: string[]; // sequence of node ids
}
