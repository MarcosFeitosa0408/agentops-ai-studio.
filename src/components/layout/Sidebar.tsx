'use client';

import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Activity,
  Sliders,
  Database,
  Cpu,
  Settings,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemSelect?: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeItem = 'Showcase',
  onItemSelect,
}) => {
  const menuItems = [
    { id: 'Showcase', label: 'Design Showcase', icon: LayoutDashboard },
    { id: 'Tokens', label: 'Design Tokens', icon: Sliders },
    { id: 'Buttons', label: 'Buttons & Badges', icon: Sparkles },
    { id: 'Inputs', label: 'Inputs & Controls', icon: Cpu },
    { id: 'Overlays', label: 'Overlays & Dialogs', icon: Boxes },
    { id: 'Status', label: 'Status & Indicators', icon: Activity },
    { id: 'Layouts', label: 'Layout Showcase', icon: Database },
  ];

  const secondaryItems = [
    { id: 'Settings', label: 'Settings', icon: Settings },
    { id: 'Help', label: 'Help & Docs', icon: HelpCircle },
  ];

  const handleSelect = (id: string) => {
    if (onItemSelect) onItemSelect(id);
    onClose(); // Auto close on mobile
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`border-border bg-surface fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out select-none lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:z-0 lg:h-[calc(100vh-4rem)]`}
      >
        {/* Mobile Header Close button */}
        <div className="border-border flex h-16 items-center justify-between border-b px-6 lg:hidden">
          <span className="text-text-primary font-bold tracking-tight">Navigation</span>
          <IconButton variant="ghost" size="sm" onClick={onClose} aria-label="Close Navigation">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Navigation lists */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            <p className="text-text-muted px-3 text-[10px] font-semibold tracking-wider uppercase">
              Core Components
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeItem;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none select-none ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-text-secondary hover:bg-neutral-light hover:text-text-primary'
                  } `}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="text-text-muted px-3 text-[10px] font-semibold tracking-wider uppercase">
              System
            </p>
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeItem;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none select-none ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-text-secondary hover:bg-neutral-light hover:text-text-primary'
                  } `}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info in Sidebar */}
        <div className="border-border border-t p-4 select-none">
          <div className="bg-neutral-light/50 border-border/40 rounded-xl border p-3.5 text-center">
            <p className="text-text-primary text-xs font-semibold">Enterprise Version</p>
            <p className="text-text-muted mt-1 text-[10px]">v0.1.0 &bull; UI Library</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
