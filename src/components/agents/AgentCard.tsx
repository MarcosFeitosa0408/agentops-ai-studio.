'use client';

import React from 'react';
import { Edit2, Copy, Trash2, Power, Clock, Cpu, Settings } from 'lucide-react';
import { Agent } from '@/types/agent';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { AgentStatusBadge } from './AgentStatusBadge';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (agent: Agent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  isSelected = false,
  onSelect,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(agent);
    }
  };

  return (
    <Card
      interactive
      className={`relative flex flex-col justify-between p-5 transition-all duration-300 ${
        isSelected
          ? 'border-primary ring-primary/20 bg-primary/5 dark:bg-primary/10 ring-2'
          : 'hover:border-primary/25 border-border bg-card'
      }`}
      onClick={handleCardClick}
    >
      {/* Card Header & Badges */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h4 className="text-text-primary text-base font-bold tracking-tight group-hover:text-primary transition-colors">
              {agent.name}
            </h4>
            <Badge variant="outline" size="sm" className="bg-neutral-light/50 font-normal">
              {agent.specialty}
            </Badge>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>

        {/* Short Description */}
        <p className="text-text-secondary text-xs leading-relaxed">
          {truncateText(agent.description, 110)}
        </p>

        {/* Configuration Placeholders Details */}
        <div className="bg-neutral-light/30 border-border/40 rounded-lg border p-2 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-primary" />
            <span className="font-medium">{agent.model}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="h-3 w-3 text-accent" />
            <span>Temp: <strong className="font-semibold text-text-primary">{agent.temperature.toFixed(1)}</strong></span>
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata and Actions */}
      <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-3.5">
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <Clock className="h-3 w-3" />
          <span>Atualizado em {formatDate(agent.updatedAt)}</span>
        </div>

        {/* Quick Buttons Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Alternar Status" position="top">
            <IconButton
              variant="outline"
              size="xs"
              aria-label="Ativar ou desativar agente"
              onClick={() => onToggleStatus(agent.id)}
              className={agent.status === 'active' ? 'text-success hover:bg-success/10' : 'text-text-muted hover:bg-neutral-light'}
            >
              <Power className="h-3.5 w-3.5" />
            </IconButton>
          </Tooltip>

          <Tooltip content="Editar Agente" position="top">
            <IconButton
              variant="outline"
              size="xs"
              aria-label="Editar agente"
              onClick={() => onEdit(agent)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </IconButton>
          </Tooltip>

          <Tooltip content="Duplicar Agente" position="top">
            <IconButton
              variant="outline"
              size="xs"
              aria-label="Duplicar agente"
              onClick={() => onDuplicate(agent.id)}
            >
              <Copy className="h-3.5 w-3.5" />
            </IconButton>
          </Tooltip>

          <Tooltip content="Excluir Agente" position="top">
            <IconButton
              variant="outline"
              size="xs"
              aria-label="Excluir agente"
              onClick={() => onDelete(agent.id)}
              className="hover:border-danger/30 hover:bg-danger/10 text-text-muted hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;
