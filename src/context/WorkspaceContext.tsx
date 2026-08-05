'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace } from '../lib/workspaces/types';
import { INITIAL_WORKSPACES } from '../lib/workspaces/workspaceService';
import { useAuth } from './AuthContext';
import { OrganizationIsolation } from '@/organizations/OrganizationIsolation';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, description: string, department: string) => Workspace;
  addMemberToWorkspace: (workspaceId: string, userId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedWorkspaces = localStorage.getItem('s8_workspaces');
        if (storedWorkspaces) {
          setWorkspaces(JSON.parse(storedWorkspaces));
        }
      } catch (e) {
        console.error('Error hydrating workspaces:', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Set active workspace based on current user and localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!currentUser) {
        setActiveWorkspace(null);
        return;
      }

      // Filter workspaces user is member of AND belongs to the active organization
      const userWorkspaces = workspaces.filter((ws) => {
        try {
          if (!OrganizationIsolation.isUserAllowed(ws.ownerId)) return false;
        } catch {
          // ignore
        }
        return ws.members.includes(currentUser.id);
      });
      if (userWorkspaces.length === 0) {
        setActiveWorkspace(null);
        return;
      }

      const storedActiveId = localStorage.getItem('s8_active_workspace_id');
      const found = userWorkspaces.find((ws) => ws.id === storedActiveId);

      if (found) {
        setActiveWorkspace(found);
      } else {
        setActiveWorkspace(userWorkspaces[0]);
        localStorage.setItem('s8_active_workspace_id', userWorkspaces[0].id);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUser, workspaces]);

  const switchWorkspace = (workspaceId: string) => {
    const found = workspaces.find((ws) => ws.id === workspaceId);
    if (found && currentUser && found.members.includes(currentUser.id)) {
      try {
        if (!OrganizationIsolation.isUserAllowed(found.ownerId)) return;
      } catch {
        // ignore
      }
      setActiveWorkspace(found);
      localStorage.setItem('s8_active_workspace_id', workspaceId);
    }
  };

  const createWorkspace = (name: string, description: string, department: string): Workspace => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      department,
      ownerId: currentUser?.id || 'system',
      members: currentUser ? [currentUser.id] : [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    localStorage.setItem('s8_workspaces', JSON.stringify(updated));

    // Automatically switch to the newly created workspace
    setActiveWorkspace(newWs);
    localStorage.setItem('s8_active_workspace_id', newWs.id);

    return newWs;
  };

  const addMemberToWorkspace = (workspaceId: string, userId: string) => {
    const updated = workspaces.map((ws) => {
      if (ws.id === workspaceId) {
        if (!ws.members.includes(userId)) {
          return { ...ws, members: [...ws.members, userId] };
        }
      }
      return ws;
    });
    setWorkspaces(updated);
    localStorage.setItem('s8_workspaces', JSON.stringify(updated));
  };

  const exposedWorkspaces = workspaces.filter((ws) => {
    try {
      return OrganizationIsolation.isUserAllowed(ws.ownerId);
    } catch {
      return true;
    }
  });

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: exposedWorkspaces,
        activeWorkspace,
        switchWorkspace,
        createWorkspace,
        addMemberToWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
export default WorkspaceContext;
