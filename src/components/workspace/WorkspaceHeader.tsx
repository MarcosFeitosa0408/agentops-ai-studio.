'use client';

import React from 'react';
import { Menu, Sun, Moon, ArrowLeft } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

interface WorkspaceHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  onToggleSidebar?: () => void;
  actions?: React.ReactNode;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  breadcrumbs,
  onToggleSidebar,
  actions,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-border bg-surface/80 sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-200 select-none">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section: Breadcrumbs & Mobile Trigger */}
        <div className="flex items-center gap-3 overflow-hidden">
          {onToggleSidebar && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              aria-label="Toggle Workspace Sidebar"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          )}

          <div className="flex flex-col justify-center overflow-hidden">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="hidden sm:block">
                <Breadcrumb
                  items={breadcrumbs.map((b) => ({
                    label: b.label,
                  }))}
                />
              </div>
            ) : null}
            <h1 className="text-text-primary text-base font-bold tracking-tight truncate sm:text-lg">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section: Custom Actions, Darkmode and Back to Showcase */}
        <div className="flex items-center gap-3 shrink-0">
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          <div className="bg-border hidden h-6 w-[1px] sm:block" />

          {/* Theme switcher */}
          <IconButton
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </IconButton>

          {/* Back to Showcase link */}
          <Link href="/" passHref legacyBehavior>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Voltar para Showcase"
              className="hidden md:inline-flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="ml-1">Design System</span>
            </IconButton>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
