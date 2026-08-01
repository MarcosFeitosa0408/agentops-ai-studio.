'use client';

import React, { useState } from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceHeader } from './WorkspaceHeader';
import { Agent } from '@/types/agent';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  activePath: 'dashboard' | 'agents' | 'memory' | 'knowledge' | 'playground' | 'settings' | 'tools' | 'workflows';
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  agents?: Agent[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  onCreateAgentClick?: () => void;
  headerActions?: React.ReactNode;
  propertiesPanel?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  children,
  activePath,
  title,
  breadcrumbs,
  agents = [],
  selectedAgentId,
  onAgentSelect,
  onCreateAgentClick,
  headerActions,
  propertiesPanel,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col transition-colors duration-200">
      {/* Top Header */}
      <WorkspaceHeader
        title={title}
        breadcrumbs={breadcrumbs}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        actions={headerActions}
      />

      {/* Main Body Shell */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <WorkspaceSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activePath={activePath}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentSelect={(agent) => {
            onAgentSelect?.(agent);
            setIsSidebarOpen(false); // Close mobile drawer
          }}
          onCreateAgentClick={onCreateAgentClick}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-light/10 dark:bg-neutral-dark/20">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Main Center Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 min-w-0">
              {children}
            </main>

            {/* Optional Right Panel (Properties Panel) */}
            {propertiesPanel && (
              <aside className="border-border bg-card lg:border-l w-full lg:w-96 overflow-y-auto border-t lg:border-t-0 p-6 shrink-0 shadow-xs lg:h-[calc(100vh-4rem)]">
                {propertiesPanel}
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
