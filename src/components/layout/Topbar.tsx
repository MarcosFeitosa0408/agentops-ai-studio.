'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell, Menu, Shield, LogOut, Building } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/components/ui/Toast';
import { useIsMounted } from '@/hooks/useIsMounted';

export interface TopbarProps {
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { toast } = useToast();
  const isMounted = useIsMounted();
  const router = useRouter();

  const handleNotificationClick = () => {
    toast('System Alert', 'No new system issues detected.', 'success');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast('Sessão Encerrada', 'Você saiu da sua conta corporativa com segurança.', 'success');
  };

  const userWorkspaces = workspaces.filter((ws) => currentUser && ws.members.includes(currentUser.id));

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

          {/* Active Workspace Switcher */}
          {currentUser && activeWorkspace && (
            <div className="hidden items-center gap-1.5 md:flex ml-2">
              <Building className="h-3.5 w-3.5 text-text-muted" />
              <select
                value={activeWorkspace.id}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px]"
              >
                {userWorkspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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

          {/* User Info & Actions */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Profile Link */}
              <div
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-xs text-primary">
                  {currentUser.avatar}
                </div>
                <div className="hidden flex-col text-left select-none sm:flex">
                  <span className="text-text-primary text-xs leading-tight font-semibold">
                    {currentUser.name}
                  </span>
                  <span className="text-text-muted text-[10px] leading-none">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Fazer Logout"
                className="text-text-muted hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
              </IconButton>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-semibold text-primary hover:underline px-2.5 py-1.5"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
