import { UserRole } from '../auth/types';

export type Permission =
  | 'create:agents'
  | 'edit:agents'
  | 'delete:agents'
  | 'execute:agents'
  | 'manage:providers'
  | 'run:python'
  | 'run:sql'
  | 'view:audit'
  | 'manage:workspaces'
  | 'view:billing';

export type RolePermissionsMap = Record<UserRole, Permission[]>;
