import { describe, it, expect } from 'vitest';
import { RBACService, ROLE_PERMISSIONS } from '@/lib/rbac/rbacService';

describe('RBAC Service Unit Tests', () => {
  it('should grant all permissions to Super Admin', () => {
    const superAdminPerms = ROLE_PERMISSIONS['Super Admin'];
    expect(superAdminPerms).toBeDefined();

    superAdminPerms.forEach((perm) => {
      expect(RBACService.hasPermission('Super Admin', perm)).toBe(true);
    });
  });

  it('should deny unauthorized permissions', () => {
    // Viewer should not have write permissions
    expect(RBACService.hasPermission('Viewer', 'create:agents')).toBe(false);
    expect(RBACService.hasPermission('Viewer', 'run:sql')).toBe(false);

    // Viewer should have execute:agents
    expect(RBACService.hasPermission('Viewer', 'execute:agents')).toBe(true);
  });

  it('should handle unknown roles gracefully', () => {
    // @ts-expect-error - testing invalid role input
    expect(RBACService.hasPermission('UnknownRole', 'create:agents')).toBe(false);
    // @ts-expect-error - testing invalid role input
    expect(RBACService.getPermissions('UnknownRole')).toEqual([]);
  });

  it('should return correct permission arrays for each role', () => {
    expect(RBACService.getPermissions('Admin')).toContain('create:agents');
    expect(RBACService.getPermissions('Viewer')).toEqual(['execute:agents']);
  });
});
