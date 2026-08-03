import { UserRole } from '../auth/types';
import { Permission, RolePermissionsMap } from './types';

export const ROLE_PERMISSIONS: RolePermissionsMap = {
  'Super Admin': [
    'create:agents',
    'edit:agents',
    'delete:agents',
    'execute:agents',
    'manage:providers',
    'run:python',
    'run:sql',
    'view:audit',
    'manage:workspaces',
    'view:billing',
  ],
  Admin: [
    'create:agents',
    'edit:agents',
    'delete:agents',
    'execute:agents',
    'manage:providers',
    'run:python',
    'run:sql',
    'view:audit',
    'manage:workspaces',
  ],
  Manager: [
    'create:agents',
    'edit:agents',
    'execute:agents',
    'run:python',
    'run:sql',
    'view:audit',
  ],
  'AI Developer': [
    'create:agents',
    'edit:agents',
    'execute:agents',
    'run:python',
    'run:sql',
  ],
  'Data Analyst': [
    'execute:agents',
    'run:sql',
  ],
  Viewer: [
    'execute:agents',
  ],
};

export class RBACService {
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  static getPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}
export default RBACService;
