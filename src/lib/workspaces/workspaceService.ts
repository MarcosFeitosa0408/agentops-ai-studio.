import { Workspace } from './types';

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-finance',
    name: 'Finanças & Analytics',
    description: 'Workspace isolado para análise fiscal, orçamento e dashboards financeiros de custos.',
    department: 'Finance',
    ownerId: 'user-1',
    members: ['user-1', 'user-3', 'user-5'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ws-marketing',
    name: 'Marketing & CRM',
    description: 'Geração de conteúdo criativo, automação de posts e mídias sociais.',
    department: 'Marketing',
    ownerId: 'user-2',
    members: ['user-1', 'user-2', 'user-5'],
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'ws-engineering',
    name: 'Engenharia de Software',
    description: 'Dev e homologação de microsserviços, code review e agentes de devops.',
    department: 'Engineering',
    ownerId: 'user-1',
    members: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    createdAt: '2026-03-10T00:00:00.000Z',
  },
];

export class WorkspaceService {
  static getWorkspacesForUser(userId: string, workspaces: Workspace[]): Workspace[] {
    return workspaces.filter((ws) => ws.members.includes(userId));
  }
}
export default WorkspaceService;
