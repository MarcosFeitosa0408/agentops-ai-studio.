'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onChange, variant = 'line' }) => {
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const listVariants = {
    line: 'border-b border-border flex gap-6',
    pills: 'bg-neutral-light/50 p-1 rounded-xl flex gap-1 border border-border/40',
    enclosed: 'border-b border-border flex gap-1',
  };

  const buttonVariants = (isActive: boolean, disabled?: boolean) => {
    if (disabled) return 'text-text-muted/50 cursor-not-allowed';

    if (variant === 'line') {
      return `pb-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer -mb-px
        ${
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
        }
      `;
    }

    if (variant === 'pills') {
      return `px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
        ${
          isActive
            ? 'bg-surface text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }
      `;
    }

    // enclosed
    return `px-4 py-2 text-sm font-medium rounded-t-lg border-t border-x transition-all duration-200 cursor-pointer -mb-px
      ${
        isActive
          ? 'bg-surface border-border text-primary'
          : 'bg-transparent border-transparent text-text-secondary hover:text-text-primary'
      }
    `;
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Tab List */}
      <div className={listVariants[variant]} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`${buttonVariants(isActive, tab.disabled)} inline-flex items-center gap-2 outline-none`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div role="tabpanel" className="animate-in fade-in mt-2 duration-200">
        {activeTab?.content}
      </div>
    </div>
  );
};

export default Tabs;
