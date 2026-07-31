'use client';

import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Terminal,
  Database,
  Search,
  BookOpen,
  Calculator,
  Server,
  FileSpreadsheet,
  Braces,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { ToolExecution, ToolStatus, ToolResult, ToolCategory } from '@/lib/tools/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal,
  Database,
  Search,
  BookOpen,
  Calculator,
  Server,
  FileSpreadsheet,
  Braces,
};

// 1. ExecutionStatus
export const ExecutionStatus: React.FC<{ status: ToolStatus }> = ({ status }) => {
  const styles = {
    idle: 'text-text-muted bg-neutral-light/50 border-border',
    executing: 'text-primary bg-primary/10 border-primary/20 animate-pulse',
    success: 'text-success bg-success/10 border-success/20',
    failed: 'text-danger bg-danger/10 border-danger/20',
    healthy: 'text-success bg-success/10 border-success/20',
    unhealthy: 'text-danger bg-danger/10 border-danger/20',
  };

  const icons = {
    idle: <RefreshCw className="h-3 w-3" />,
    executing: <RefreshCw className="h-3 w-3 animate-spin" />,
    success: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
    healthy: <CheckCircle className="h-3 w-3" />,
    unhealthy: <XCircle className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
        styles[status] || styles.idle
      }`}
    >
      {icons[status] || icons.idle}
      {status}
    </span>
  );
};

// 2. ExecutionBadge
export const ExecutionBadge: React.FC<{ category: string }> = ({ category }) => {
  return (
    <span className="bg-neutral-light/50 border border-border/80 text-text-secondary rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
      {category}
    </span>
  );
};

// 3. ExecutionMetrics
export const ExecutionMetrics: React.FC<{ durationMs?: number; tokens?: number }> = ({
  durationMs = 0,
  tokens = 0,
}) => {
  return (
    <div className="flex items-center gap-3.5 text-text-muted text-[11px] font-medium select-none text-left">
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-primary" />
        {durationMs}ms
      </span>
      {tokens > 0 && (
        <span className="flex items-center gap-1 border-l border-border/60 pl-3.5">
          <Cpu className="h-3.5 w-3.5 text-accent" />
          {tokens} tokens
        </span>
      )}
    </div>
  );
};

// 4. ExecutionStep
export const ExecutionStep: React.FC<{
  toolId: string;
  toolName: string;
  iconName?: string;
  reason: string;
  durationMs?: number;
  status: ToolStatus;
  input: Record<string, unknown>;
  output?: ToolResult;
}> = ({ toolId, toolName, iconName = 'Terminal', reason, durationMs = 0, status, input, output }) => {
  const Icon = iconMap[iconName] || Terminal;

  return (
    <div className="border border-border/60 bg-card rounded-xl p-4.5 space-y-3 shadow-xs hover:border-primary/25 transition-all text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg border border-primary/10">
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-text-primary text-xs font-bold leading-none tracking-tight">
              {toolName}
            </h4>
            <p className="text-text-muted text-[10px] leading-none">{toolId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExecutionStatus status={status} />
          <ExecutionMetrics durationMs={durationMs} tokens={output?.metrics?.tokensUsed} />
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Reasoning Plan</span>
        <p className="text-text-secondary text-xs leading-relaxed italic">&quot;{reason}&quot;</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
        <div className="space-y-1 bg-neutral-light/20 border border-border/40 p-2.5 rounded-lg">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Arguments Input</span>
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-text-secondary whitespace-pre-wrap max-h-24">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>

        <div className="space-y-1 bg-neutral-light/20 border border-border/40 p-2.5 rounded-lg">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Output Value</span>
          {output ? (
            <pre className={`text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-24 ${output.success ? 'text-success' : 'text-danger'}`}>
              {JSON.stringify(output.data || output.error || {}, null, 2)}
            </pre>
          ) : (
            <p className="text-text-muted text-[11px] leading-none">No output captured.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// 5. ExecutionCard
export const ExecutionCard: React.FC<{
  execution: ToolExecution;
  toolName: string;
  category: string;
  iconName?: string;
}> = ({ execution, toolName, category, iconName = 'Terminal' }) => {
  return (
    <ExecutionStep
      toolId={execution.toolId}
      toolName={toolName}
      iconName={iconName}
      reason={`Invoking registered category pipeline '${category}'`}
      durationMs={execution.durationMs}
      status={execution.status}
      input={execution.input}
      output={execution.output}
    />
  );
};

// 6. ExecutionTimeline
export const ExecutionTimeline: React.FC<{
  steps: {
    toolId: string;
    toolName: string;
    iconName?: string;
    reason: string;
    durationMs?: number;
    status: ToolStatus;
    input: Record<string, unknown>;
    output?: ToolResult;
  }[];
}> = ({ steps }) => {
  if (steps.length === 0) {
    return (
      <div className="border border-dashed border-border/80 rounded-xl p-10 text-center select-none bg-card">
        <Play className="h-7 w-7 text-text-muted mx-auto mb-2.5" />
        <p className="text-text-primary text-xs font-bold">Timeline Empty</p>
        <p className="text-text-muted text-[11px] mt-0.5">No steps executed yet.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-border/60 pl-6 space-y-6">
      {steps.map((step, idx) => {
        const Icon = iconMap[step.iconName || 'Terminal'] || Terminal;
        return (
          <div key={idx} className="relative">
            {/* Timeline Node Connector */}
            <span className="absolute -left-[35px] top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-primary shadow-xs">
              <Icon className="h-3.5 w-3.5" />
            </span>

            <ExecutionStep {...step} />
          </div>
        );
      })}
    </div>
  );
};

// 7. ExecutionToolbar
export const ExecutionToolbar: React.FC<{
  onRefresh?: () => void;
  onClear?: () => void;
  disabledClear?: boolean;
}> = ({ onRefresh, onClear, disabledClear }) => {
  return (
    <div className="flex items-center justify-between border-b border-border p-3.5 bg-neutral-light/10 select-none text-left">
      <span className="text-text-primary text-xs font-bold">Execution Log Console</span>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-border/80 bg-card hover:bg-neutral-light text-text-secondary transition-all cursor-pointer"
            aria-label="Refresh Executions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
        {onClear && (
          <button
            onClick={onClear}
            disabled={disabledClear}
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-danger/10 bg-danger/5 hover:bg-danger/10 text-danger transition-all cursor-pointer disabled:opacity-40"
          >
            Clear Log History
          </button>
        )}
      </div>
    </div>
  );
};

// 8. ExecutionHistory
export const ExecutionHistory: React.FC<{
  logs: ToolExecution[];
  getToolMeta: (id: string) => { name: string; category: ToolCategory; icon: string } | undefined;
}> = ({ logs, getToolMeta }) => {
  if (logs.length === 0) {
    return (
      <div className="border border-dashed border-border/80 rounded-xl p-12 text-center text-text-muted bg-card">
        No executions in local history log.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
      {logs.map((log) => {
        const meta = getToolMeta(log.toolId) || {
          name: 'Unknown Tool',
          category: 'Memory' as ToolCategory,
          icon: 'Terminal',
        };
        return (
          <ExecutionCard
            key={log.id}
            execution={log}
            toolName={meta.name}
            category={meta.category}
            iconName={meta.icon}
          />
        );
      })}
    </div>
  );
};
