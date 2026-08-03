import { User, UserRole } from './types';

// Mock DB of users for simulated enterprise auth
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Marcos Feitosa',
    email: 'marcos@agentops.ai',
    role: 'Super Admin',
    avatar: 'MF',
    workspaces: ['ws-finance', 'ws-marketing', 'ws-engineering'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    name: 'Julia Lima',
    email: 'julia@agentops.ai',
    role: 'Admin',
    avatar: 'JL',
    workspaces: ['ws-marketing', 'ws-engineering'],
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'user-3',
    name: 'Daniel Santos',
    email: 'daniel@agentops.ai',
    role: 'Manager',
    avatar: 'DS',
    workspaces: ['ws-finance', 'ws-engineering'],
    createdAt: '2026-03-10T00:00:00.000Z',
  },
  {
    id: 'user-4',
    name: 'Dev Core',
    email: 'dev@agentops.ai',
    role: 'AI Developer',
    avatar: 'DC',
    workspaces: ['ws-engineering'],
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'user-5',
    name: 'Audit Guest',
    email: 'viewer@agentops.ai',
    role: 'Viewer',
    avatar: 'AG',
    workspaces: ['ws-finance', 'ws-marketing', 'ws-engineering'],
    createdAt: '2026-05-20T00:00:00.000Z',
  },
];

export class AuthService {
  static login(email: string): User | null {
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static register(name: string, email: string, role: UserRole): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      workspaces: ['ws-engineering'], // Default workspace
      createdAt: new Date().toISOString(),
    };
    return newUser;
  }

  // Simulates JWT encryption by prefixing/masking
  static generateToken(user: User): string {
    return `jwt_session_token_${btoa(JSON.stringify({ id: user.id, r: user.role }))}`;
  }

  // Simulates GCM / secret masking
  static encryptSecret(secret: string): string {
    if (!secret) return '';
    const masked = secret.slice(0, 4) + '****************' + secret.slice(-4);
    return `aes256_gcm_${btoa(masked)}`;
  }
}
export default AuthService;
