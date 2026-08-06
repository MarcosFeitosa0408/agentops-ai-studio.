'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Cpu,
  Search,
  X,
  ArrowLeft,
  ChevronRight,
  Shield,
  Plus,
  Sparkles,
  Settings,
  Database,
  BookOpen,
  Wrench,
  GitBranch,
  Folder,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { Agent } from '@/types/agent';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath:
    | 'dashboard'
    | 'agents'
    | 'memory'
    | 'knowledge'
    | 'playground'
    | 'settings'
    | 'tools'
    | 'workflows'
    | 'workspaces'
    | 'security'
    | 'profile'
    | 'admin'
    | 'organizations';
  agents?: Agent[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  onCreateAgentClick?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  isOpen,
  onClose,
  activePath,
  agents = [],
  selectedAgentId,
  onAgentSelect,
  onCreateAgentClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const mainNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: activePath === 'dashboard',
    },
    {
      label: 'Agentes',
      icon: Cpu,
      href: '/agents',
      active: activePath === 'agents',
    },
    {
      label: 'Playground',
      icon: Sparkles,
      href: '/playground',
      active: activePath === 'playground',
    },
    {
      label: 'Workflows',
      icon: GitBranch,
      href: '/workflows',
      active: activePath === 'workflows',
    },
    {
      label: 'Ferramentas',
      icon: Wrench,
      href: '/tools',
      active: activePath === 'tools',
    },
    {
      label: 'Memória Cognitiva',
      icon: Database,
      href: '/memory',
      active: activePath === 'memory',
    },
    {
      label: 'Conhecimento RAG',
      icon: BookOpen,
      href: '/knowledge',
      active: activePath === 'knowledge',
    },
    {
      label: 'Configurações Core',
      icon: Settings,
      href: '/settings',
      active: activePath === 'settings',
    },
  ];

  const enterpriseNavItems = [
    {
      label: 'Painel Admin (IT)',
      icon: ShieldAlert,
      href: '/admin',
      active: activePath === 'admin',
      visible: isAdmin,
    },
    {
      label: 'Organizações',
      icon: Building2,
      href: '/organizations',
      active: activePath === 'organizations',
      visible: isAdmin,
    },
    {
      label: 'Workspaces',
      icon: Folder,
      href: '/workspaces',
      active: activePath === 'workspaces',
      visible: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`border-border bg-surface fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r transition-transform duration-300 ease-in-out select-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-0 lg:h-[calc(100vh-4rem)]`}
      >
        {/* Mobile Header */}
        <div className="border-border flex h-16 items-center justify-between border-b px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-text-primary text-base font-bold">Studio Menu</span>
          </div>
          <IconButton variant="ghost" size="sm" onClick={onClose} aria-label="Close Sidebar">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Studio Branding */}
        <div className="border-border hidden h-16 items-center gap-3 border-b px-6 lg:flex select-none">
          <div className="from-primary to-accent flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-text-primary text-sm font-bold tracking-tight">
              AgentOps Studio
            </span>
            <span className="text-primary text-[10px] font-semibold uppercase tracking-wider">
              AI Agent Workspace
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            <p className="text-text-muted px-3 text-[10px] text-left font-semibold tracking-wider uppercase">
              Menu Principal
            </p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} passHref legacyBehavior>
                  <a
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none select-none ${
                      item.active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-text-secondary hover:bg-neutral-light hover:text-text-primary'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>

          {/* Governance & Enterprise Navigation */}
          <div className="space-y-1 pt-2">
            <p className="text-text-muted px-3 text-[10px] text-left font-semibold tracking-wider uppercase">
              Governança & Enterprise
            </p>
            {enterpriseNavItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} passHref legacyBehavior>
                    <a
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none select-none ${
                        item.active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-text-secondary hover:bg-neutral-light hover:text-text-primary'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                );
              })}
          </div>

          {/* Quick Agent Selection (only relevant if we have agents list supplied) */}
          {agents.length > 0 && activePath === 'agents' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-3">
                <p className="text-text-muted text-[10px] font-semibold tracking-wider uppercase">
                  Seus Agentes ({agents.length})
                </p>
                {onCreateAgentClick && (
                  <button
                    onClick={onCreateAgentClick}
                    className="text-primary hover:text-primary-hover cursor-pointer p-0.5"
                    aria-label="Adicionar agente"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sidebar Mini Search */}
              <div className="px-2">
                <Input
                  placeholder="Filtrar agentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-1 h-8 text-xs bg-neutral-light/30"
                  leftElement={<Search className="h-3 w-3 text-text-muted" />}
                />
              </div>

              {/* Mini Agent List */}
              <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
                {filteredAgents.map((agent) => {
                  const isSelected = agent.id === selectedAgentId;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => onAgentSelect?.(agent)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all duration-200 outline-none ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5'
                          : 'text-text-secondary hover:bg-neutral-light/50 hover:text-text-primary'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{agent.name}</span>
                        <span className="text-[10px] text-text-muted font-normal truncate">
                          {agent.specialty}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 shrink-0">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            agent.status === 'active' ? 'bg-success' : 'bg-text-muted/50'
                          }`}
                        />
                        <ChevronRight className="h-3 w-3 text-text-muted/60" />
                      </span>
                    </button>
                  );
                })}

                {filteredAgents.length === 0 && (
                  <p className="text-text-muted px-3 py-2 text-center text-[11px]">
                    Nenhum agente encontrado.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts / design showcase links */}
        <div className="border-border border-t p-4">
          <Link href="/" passHref legacyBehavior>
            <a className="bg-neutral-light/50 hover:bg-neutral-light border-border/40 flex items-center justify-center gap-2 rounded-xl border p-3.5 text-center transition-all">
              <ArrowLeft className="h-3.5 w-3.5 text-primary" />
              <div className="flex flex-col items-start">
                <span className="text-text-primary text-[11px] font-bold">Design Showcase</span>
                <span className="text-text-muted text-[9px]">Ver componentes base</span>
              </div>
            </a>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default WorkspaceSidebar;
