export type OrganizationRole =
  | 'Owner'
  | 'Admin'
  | 'Manager'
  | 'Developer'
  | 'Analyst'
  | 'Viewer'
  | 'Guest';

export interface PermissionMatrix {
  canManageUsers: boolean;
  canManageWorkers: boolean;
  canManagePlugins: boolean;
  canManageSettings: boolean;
  canManageBusinessResources: boolean;
  canCreateWorkflows: boolean;
  canExecuteWorkers: boolean;
  canViewDashboards: boolean;
  canReadOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<OrganizationRole, PermissionMatrix> = {
  Owner: {
    canManageUsers: true,
    canManageWorkers: true,
    canManagePlugins: true,
    canManageSettings: true,
    canManageBusinessResources: true,
    canCreateWorkflows: true,
    canExecuteWorkers: true,
    canViewDashboards: true,
    canReadOnly: true,
  },
  Admin: {
    canManageUsers: true,
    canManageWorkers: true,
    canManagePlugins: true,
    canManageSettings: true,
    canManageBusinessResources: true,
    canCreateWorkflows: true,
    canExecuteWorkers: true,
    canViewDashboards: true,
    canReadOnly: true,
  },
  Manager: {
    canManageUsers: false,
    canManageWorkers: true,
    canManagePlugins: false,
    canManageSettings: false,
    canManageBusinessResources: true,
    canCreateWorkflows: true,
    canExecuteWorkers: true,
    canViewDashboards: true,
    canReadOnly: true,
  },
  Developer: {
    canManageUsers: false,
    canManageWorkers: true,
    canManagePlugins: false,
    canManageSettings: false,
    canManageBusinessResources: false,
    canCreateWorkflows: true,
    canExecuteWorkers: true,
    canViewDashboards: true,
    canReadOnly: true,
  },
  Analyst: {
    canManageUsers: false,
    canManageWorkers: false,
    canManagePlugins: false,
    canManageSettings: false,
    canManageBusinessResources: false,
    canCreateWorkflows: false,
    canExecuteWorkers: true,
    canViewDashboards: true,
    canReadOnly: true,
  },
  Viewer: {
    canManageUsers: false,
    canManageWorkers: false,
    canManagePlugins: false,
    canManageSettings: false,
    canManageBusinessResources: false,
    canCreateWorkflows: false,
    canExecuteWorkers: false,
    canViewDashboards: true,
    canReadOnly: true,
  },
  Guest: {
    canManageUsers: false,
    canManageWorkers: false,
    canManagePlugins: false,
    canManageSettings: false,
    canManageBusinessResources: false,
    canCreateWorkflows: false,
    canExecuteWorkers: false,
    canViewDashboards: false,
    canReadOnly: true,
  },
};

export class OrganizationRoles {
  static hasPermission(role: OrganizationRole, permission: keyof PermissionMatrix): boolean {
    return ROLE_PERMISSIONS[role]?.[permission] || false;
  }

  static canRoleModify(role: OrganizationRole): boolean {
    return role !== 'Viewer' && role !== 'Guest';
  }

  static canRoleCreate(role: OrganizationRole): boolean {
    return role !== 'Viewer' && role !== 'Guest';
  }
}
export default OrganizationRoles;
