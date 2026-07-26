'use client';

import React from 'react';
import { Sun, Moon, Bell, Menu, Shield } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { IconButton } from '@/components/ui/IconButton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';

export interface TopbarProps {
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const isMounted = useIsMounted();

  const handleNotificationClick = () => {
    toast('System Alert', 'No new system issues detected.', 'success');
  };

  return (
    <header className="border-border bg-surface/80 sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 select-none">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section: Hamburger & Brand */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          )}
          <div className="flex items-center gap-2">
            <div className="from-primary to-accent flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-text-primary hidden text-lg font-bold tracking-tight sm:block">
              AgentOps AI <span className="text-primary">Studio</span>
            </span>
          </div>
          <Badge variant="primary" className="hidden md:inline-flex">
            Sprint 2 DS
          </Badge>
        </div>

        {/* Right section: System Utilities, Theme, Notify, User */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <IconButton
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={
              isMounted ? `Switch to ${theme === 'light' ? 'dark' : 'light'} theme` : 'Switch theme'
            }
          >
            {isMounted ? (
              theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <span className="block h-4 w-4" />
            )}
          </IconButton>

          {/* Notifications */}
          <div className="relative">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
            </IconButton>
            <span className="bg-danger absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full" />
          </div>

          <div className="bg-border h-6 w-[1px]" />

          {/* User Info */}
          <div className="flex items-center gap-2">
            <Avatar
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
              fallback="JD"
              size="sm"
            />
            <div className="hidden flex-col text-left select-none sm:flex">
              <span className="text-text-primary text-xs leading-tight font-semibold">
                Jane Doe
              </span>
              <span className="text-text-muted text-[10px] leading-none">System Architect</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
