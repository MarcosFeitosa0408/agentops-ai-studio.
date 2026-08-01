'use client';

import React from 'react';
import { WorkflowNode, WorkflowEdge } from '@/lib/workflows/types';
import {
  Play,
  Cpu,
  Wrench,
  HelpCircle,
  Clock,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  activeNodeId?: string | null;
  onNodeSelect: (id: string) => void;
  onNodeDrag?: (id: string, x: number, y: number) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  activeNodeId,
  onNodeSelect,
}) => {
  const getIconForType = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger':
        return <Play className="h-4 w-4 text-success" />;
      case 'agent':
        return <Cpu className="h-4 w-4 text-accent" />;
      case 'tool':
        return <Wrench className="h-4 w-4 text-primary" />;
      case 'condition':
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      case 'delay':
        return <Clock className="h-4 w-4 text-indigo-500" />;
      case 'loop':
        return <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin-slow" />;
      default:
        return <CheckCircle className="h-4 w-4 text-text-muted" />;
    }
  };

  return (
    <div className="relative w-full h-[550px] bg-neutral-light/5 dark:bg-neutral-dark/10 rounded-2xl border border-border overflow-hidden select-none">
      {/* Dynamic Grid Dot Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Connection SVG paths layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 2 L 10 5 L 0 8 z" fill="currentColor" className="text-border dark:text-neutral-700" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 2 L 10 5 L 0 8 z" fill="currentColor" className="text-primary" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const src = nodes.find((n) => n.id === edge.source);
          const tgt = nodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;

          // Compute connector centers
          const x1 = src.position.x + 100; // mid point of 200px width
          const y1 = src.position.y + 60;  // mid point of 120px height
          const x2 = tgt.position.x + 100;
          const y2 = tgt.position.y;       // top connector of target

          const isActiveEdge = activeNodeId === src.id || activeNodeId === tgt.id;

          // Custom cubic bezier smooth curve path
          const controlOffset = Math.abs(y2 - y1) * 0.5;
          const pathD = `M ${x1} ${y1} C ${x1} ${y1 + controlOffset}, ${x2} ${y2 - controlOffset}, ${x2} ${y2}`;

          return (
            <g key={edge.id}>
              <path
                d={pathD}
                fill="none"
                stroke={isActiveEdge ? 'var(--color-primary)' : 'currentColor'}
                strokeWidth={isActiveEdge ? 2.5 : 1.5}
                className={isActiveEdge ? 'text-primary' : 'text-border dark:text-neutral-800'}
                markerEnd={isActiveEdge ? 'url(#arrow-active)' : 'url(#arrow)'}
              />
              {edge.conditionValue && (
                <foreignObject
                  x={(x1 + x2) / 2 - 24}
                  y={(y1 + y2) / 2 - 12}
                  width="48"
                  height="24"
                >
                  <div className={`text-[9px] font-bold rounded-md border text-center py-0.5 leading-none shadow-xs uppercase select-none ${
                    edge.conditionValue === 'true'
                      ? 'bg-success/15 border-success/35 text-success'
                      : 'bg-danger/15 border-danger/35 text-danger'
                  }`}>
                    {edge.conditionValue}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render Node Cards */}
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isActive = activeNodeId === node.id;

        return (
          <div
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect(node.id);
            }}
            style={{
              left: node.position.x,
              top: node.position.y,
              position: 'absolute',
            }}
            className={`w-48 bg-card border rounded-xl p-3 shadow-xs hover:shadow-sm cursor-pointer select-none transition-all duration-200 ${
              isActive
                ? 'border-primary ring-2 ring-primary/20 shadow-md scale-102 animate-pulse'
                : isSelected
                  ? 'border-accent shadow-xs scale-101'
                  : 'border-border/80'
            }`}
          >
            <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
              <span className="p-1 rounded-md bg-neutral-light/50 border border-border">
                {getIconForType(node.type)}
              </span>
              <div className="min-w-0 text-left">
                <h5 className="text-[11px] font-bold text-text-primary leading-tight truncate">
                  {node.name}
                </h5>
                <span className="text-[8px] text-text-muted font-bold tracking-wider uppercase leading-none block">
                  {node.type}
                </span>
              </div>
            </div>

            {/* Micro parameter context info */}
            <div className="text-left text-[9px] text-text-secondary min-h-6 leading-tight">
              {node.type === 'agent' && (
                <span className="text-accent font-semibold truncate block">
                  ID: {node.config.agentId || 'Não selecionado'}
                </span>
              )}
              {node.type === 'tool' && (
                <span className="text-primary font-semibold truncate block">
                  Tool: {node.config.toolId?.replace('_tool', '').toUpperCase() || 'CALCULATOR'}
                </span>
              )}
              {node.type === 'condition' && node.config.condition && (
                <span className="text-amber-500 font-semibold block leading-normal italic truncate">
                  {node.config.condition.variableName.replace('output_', '')} {node.config.condition.operator}
                </span>
              )}
              {node.type === 'delay' && (
                <span className="text-indigo-500 font-semibold block">
                  Delay: {node.config.delayMs || 200}ms
                </span>
              )}
              {node.type === 'trigger' && (
                <span className="text-success font-semibold block uppercase tracking-wide">
                  START FLOW
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default WorkflowCanvas;
