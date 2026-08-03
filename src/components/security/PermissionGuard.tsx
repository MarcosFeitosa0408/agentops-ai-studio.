'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../lib/rbac/types';
import { RBACService } from '../../lib/rbac/rbacService';

interface PermissionGuardProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <>{fallback}</>;
  }

  const hasPerm = RBACService.hasPermission(currentUser.role, permission);

  if (!hasPerm) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default PermissionGuard;
