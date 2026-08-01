export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'AI Developer'
  | 'Data Analyst'
  | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  workspaces: string[]; // List of workspace IDs the user belongs to
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  expiresAt: number | null; // Timestamp
}
