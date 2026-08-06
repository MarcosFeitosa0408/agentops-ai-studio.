'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditLogEntry } from '../lib/audit/types';
import { AuditService } from '../lib/audit/auditService';
import { useAuth } from './AuthContext';
import { OrganizationIsolation } from '@/organizations/OrganizationIsolation';

interface AuditContextType {
  auditLogs: AuditLogEntry[];
  logAction: (action: string, description: string, workspaceId?: string) => void;
  clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    userId: 'user-1',
    userName: 'Marcos Feitosa',
    action: 'user.login',
    description: 'Login bem-sucedido na plataforma via canal corporativo seguro.',
    ip: '127.0.0.1 (VPN Local)',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    hash: 'sha256_e1a2f3f5d8e7a2b9c3c1d0e5f9a8b7c6d5e4f3a2b1',
  },
  {
    id: 'audit-2',
    userId: 'user-1',
    userName: 'Marcos Feitosa',
    action: 'workspace.switch',
    description: 'Alternou com sucesso para o Workspace de Engenharia de Software.',
    workspaceId: 'ws-engineering',
    ip: '127.0.0.1 (VPN Local)',
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    hash: 'sha256_b3d8e7a2b9c3c1d0e5f9a8b7c6d5e4f3a2b1e1a2f3f5',
  },
  {
    id: 'audit-3',
    userId: 'user-1',
    userName: 'Marcos Feitosa',
    action: 'vault.reveal',
    description: 'Visualizou credencial mascarada para API do provedor Anthropic.',
    workspaceId: 'ws-engineering',
    ip: '127.0.0.1 (VPN Local)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    hash: 'sha256_82b9c3c1d0e5f9a8b7c6d5e4f3a2b1e1a2f3f5b3d8e7a',
  },
];

export function AuditProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedLogs = localStorage.getItem('s8_audit_logs');
        if (storedLogs) {
          setAuditLogs(JSON.parse(storedLogs));
        } else {
          setAuditLogs(INITIAL_AUDIT_LOGS);
          localStorage.setItem('s8_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
        }
      } catch (e) {
        console.error('Error hydrating audit logs:', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const logAction = (action: string, description: string, workspaceId?: string) => {
    const userId = currentUser?.id || 'anonymous';
    const userName = currentUser?.name || 'Anonymous User';

    const newEntry = AuditService.createEntry(
      userId,
      userName,
      action,
      description,
      workspaceId,
    );

    setAuditLogs((prevLogs) => {
      const updated = [newEntry, ...prevLogs];
      localStorage.setItem('s8_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem('s8_audit_logs');
  };

  const exposedAuditLogs = auditLogs.filter((log) => {
    try {
      return OrganizationIsolation.isUserAllowed(log.userId);
    } catch {
      return true;
    }
  });

  return (
    <AuditContext.Provider value={{ auditLogs: exposedAuditLogs, logAction, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
export default AuditContext;
