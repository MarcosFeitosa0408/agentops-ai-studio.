import { OrganizationMember, OrganizationInvitation } from './OrganizationMember';

export const INITIAL_MEMBERS: OrganizationMember[] = [
  // Default Corp Members
  {
    id: 'member-1',
    organizationId: 'org-default',
    userId: 'user-1',
    name: 'Marcos Feitosa',
    email: 'marcos@agentops.ai',
    avatar: 'MF',
    role: 'Owner',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastAccess: '2026-08-05T12:00:00.000Z',
  },
  {
    id: 'member-2',
    organizationId: 'org-default',
    userId: 'user-2',
    name: 'Julia Lima',
    email: 'julia@agentops.ai',
    avatar: 'JL',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-02T00:00:00.000Z',
    lastAccess: '2026-08-05T10:30:00.000Z',
  },
  {
    id: 'member-3',
    organizationId: 'org-default',
    userId: 'user-3',
    name: 'Daniel Santos',
    email: 'daniel@agentops.ai',
    avatar: 'DS',
    role: 'Manager',
    status: 'Active',
    createdAt: '2026-01-03T00:00:00.000Z',
    lastAccess: '2026-08-05T09:15:00.000Z',
  },
  {
    id: 'member-4',
    organizationId: 'org-default',
    userId: 'user-4',
    name: 'Dev Core',
    email: 'dev@agentops.ai',
    avatar: 'DC',
    role: 'Developer',
    status: 'Active',
    createdAt: '2026-01-04T00:00:00.000Z',
    lastAccess: '2026-08-05T15:45:00.000Z',
  },
  {
    id: 'member-5',
    organizationId: 'org-default',
    userId: 'user-5',
    name: 'Audit Guest',
    email: 'viewer@agentops.ai',
    avatar: 'AG',
    role: 'Viewer',
    status: 'Active',
    createdAt: '2026-01-05T00:00:00.000Z',
    lastAccess: '2026-08-05T11:00:00.000Z',
  },
  // Acme Analytics Members
  {
    id: 'member-6',
    organizationId: 'org-acme',
    userId: 'user-2',
    name: 'Julia Lima',
    email: 'julia@agentops.ai',
    avatar: 'JL',
    role: 'Owner',
    status: 'Active',
    createdAt: '2026-02-15T00:00:00.000Z',
    lastAccess: '2026-08-05T10:30:00.000Z',
  },
  {
    id: 'member-7',
    organizationId: 'org-acme',
    userId: 'user-3',
    name: 'Daniel Santos',
    email: 'daniel@agentops.ai',
    avatar: 'DS',
    role: 'Manager',
    status: 'Active',
    createdAt: '2026-02-16T00:00:00.000Z',
    lastAccess: '2026-08-05T09:15:00.000Z',
  },
];

export const INITIAL_INVITATIONS: OrganizationInvitation[] = [
  {
    token: 'inv-tok-1',
    email: 'newdeveloper@agentops.ai',
    organizationId: 'org-default',
    organizationName: 'Default Corp',
    role: 'Developer',
    expiration: '2026-09-05T00:00:00.000Z',
    status: 'Pending',
    createdAt: '2026-08-05T00:00:00.000Z',
  },
  {
    token: 'inv-tok-2',
    email: 'oldguest@agentops.ai',
    organizationId: 'org-default',
    organizationName: 'Default Corp',
    role: 'Guest',
    expiration: '2026-07-05T00:00:00.000Z',
    status: 'Expired',
    createdAt: '2026-06-05T00:00:00.000Z',
  },
  {
    token: 'inv-tok-3',
    email: 'cancelledanalyst@agentops.ai',
    organizationId: 'org-default',
    organizationName: 'Default Corp',
    role: 'Analyst',
    expiration: '2026-09-05T00:00:00.000Z',
    status: 'Cancelled',
    createdAt: '2026-08-04T00:00:00.000Z',
  },
  {
    token: 'inv-tok-4',
    email: 'acmejoiner@agentops.ai',
    organizationId: 'org-acme',
    organizationName: 'Acme Analytics',
    role: 'Analyst',
    expiration: '2026-09-05T00:00:00.000Z',
    status: 'Pending',
    createdAt: '2026-08-05T00:00:00.000Z',
  },
];

export class OrganizationMemberRepository {
  private static MEMBERS_KEY = 'agentops_org_members_v1';
  private static INVITATIONS_KEY = 'agentops_org_invitations_v1';
  private static membersCache: OrganizationMember[] | null = null;
  private static invitationsCache: OrganizationInvitation[] | null = null;

  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  static listMembers(): OrganizationMember[] {
    if (this.membersCache) return this.membersCache;

    if (!this.isBrowser()) {
      this.membersCache = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
      return this.membersCache!;
    }

    try {
      const stored = localStorage.getItem(this.MEMBERS_KEY);
      if (stored) {
        this.membersCache = JSON.parse(stored);
        return this.membersCache!;
      }
      this.saveAllMembers(INITIAL_MEMBERS);
      this.membersCache = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
      return this.membersCache!;
    } catch (e) {
      console.error('Error loading organization members:', e);
      this.membersCache = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
      return this.membersCache!;
    }
  }

  static saveAllMembers(members: OrganizationMember[]): void {
    this.membersCache = members;
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Error saving organization members:', e);
    }
  }

  static findMember(id: string): OrganizationMember | undefined {
    return this.listMembers().find((m) => m.id === id);
  }

  static findMemberByUserAndOrg(userId: string, orgId: string): OrganizationMember | undefined {
    return this.listMembers().find((m) => m.userId === userId && m.organizationId === orgId && m.status !== 'Removed');
  }

  static createMember(member: OrganizationMember): OrganizationMember {
    const list = this.listMembers();
    list.push(member);
    this.saveAllMembers(list);
    return member;
  }

  static updateMember(id: string, updates: Partial<OrganizationMember>): OrganizationMember {
    const list = this.listMembers();
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Member ${id} not found`);
    }
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveAllMembers(list);
    return updated;
  }

  static listInvitations(): OrganizationInvitation[] {
    if (this.invitationsCache) return this.invitationsCache;

    if (!this.isBrowser()) {
      this.invitationsCache = JSON.parse(JSON.stringify(INITIAL_INVITATIONS));
      return this.invitationsCache!;
    }

    try {
      const stored = localStorage.getItem(this.INVITATIONS_KEY);
      if (stored) {
        this.invitationsCache = JSON.parse(stored);
        return this.invitationsCache!;
      }
      this.saveAllInvitations(INITIAL_INVITATIONS);
      this.invitationsCache = JSON.parse(JSON.stringify(INITIAL_INVITATIONS));
      return this.invitationsCache!;
    } catch (e) {
      console.error('Error loading invitations:', e);
      this.invitationsCache = JSON.parse(JSON.stringify(INITIAL_INVITATIONS));
      return this.invitationsCache!;
    }
  }

  static saveAllInvitations(invitations: OrganizationInvitation[]): void {
    this.invitationsCache = invitations;
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify(invitations));
    } catch (e) {
      console.error('Error saving invitations:', e);
    }
  }

  static findInvitation(token: string): OrganizationInvitation | undefined {
    return this.listInvitations().find((i) => i.token === token);
  }

  static createInvitation(invitation: OrganizationInvitation): OrganizationInvitation {
    const list = this.listInvitations();
    list.push(invitation);
    this.saveAllInvitations(list);
    return invitation;
  }

  static updateInvitation(token: string, updates: Partial<OrganizationInvitation>): OrganizationInvitation {
    const list = this.listInvitations();
    const index = list.findIndex((i) => i.token === token);
    if (index === -1) {
      throw new Error(`Invitation with token ${token} not found`);
    }
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveAllInvitations(list);
    return updated;
  }

  static reset(): void {
    this.membersCache = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    this.invitationsCache = JSON.parse(JSON.stringify(INITIAL_INVITATIONS));
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.MEMBERS_KEY);
        localStorage.removeItem(this.INVITATIONS_KEY);
      } catch {}
    }
  }
}
export default OrganizationMemberRepository;
