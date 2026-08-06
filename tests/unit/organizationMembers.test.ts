import { describe, it, expect, beforeEach } from 'vitest';
import { OrganizationMemberRepository } from '@/organizations/OrganizationMemberRepository';
import { OrganizationMemberManager } from '@/organizations/OrganizationMemberManager';
import { OrganizationRepository } from '@/organizations/OrganizationRepository';

describe('Organization Members & Multi-Tenant Membership Unit Tests', () => {
  beforeEach(() => {
    OrganizationRepository.reset();
    OrganizationMemberRepository.reset();
  });

  describe('Organization Roles & Permission Matrix', () => {
    it('should correctly evaluate standard role-based access permissions', () => {
      const manager = OrganizationMemberManager.getInstance();

      // Owner has full access
      expect(manager.hasResourcePermission('user-1', 'org-default', 'canManageUsers')).toBe(true);
      expect(manager.hasResourcePermission('user-1', 'org-default', 'canManageWorkers')).toBe(true);
      expect(manager.hasResourcePermission('user-1', 'org-default', 'canCreateWorkflows')).toBe(true);

      // Admin has standard management access
      expect(manager.hasResourcePermission('user-2', 'org-default', 'canManageUsers')).toBe(true);
      expect(manager.hasResourcePermission('user-2', 'org-default', 'canManageSettings')).toBe(true);

      // Manager can manage business and workers but NOT users
      expect(manager.hasResourcePermission('user-3', 'org-default', 'canManageUsers')).toBe(false);
      expect(manager.hasResourcePermission('user-3', 'org-default', 'canManageWorkers')).toBe(true);
      expect(manager.hasResourcePermission('user-3', 'org-default', 'canManageBusinessResources')).toBe(true);

      // Developer can build workers and workflows but not manage settings
      expect(manager.hasResourcePermission('user-4', 'org-default', 'canManageSettings')).toBe(false);
      expect(manager.hasResourcePermission('user-4', 'org-default', 'canCreateWorkflows')).toBe(true);

      // Analyst can execute workers and view dashboards
      expect(manager.hasResourcePermission('user-5', 'org-default', 'canManageWorkers')).toBe(false);
      expect(manager.hasResourcePermission('user-5', 'org-default', 'canExecuteWorkers')).toBe(false); // user-5 is Viewer

      // Guest role has readOnly only
      OrganizationMemberRepository.createMember({
        id: 'member-guest',
        organizationId: 'org-default',
        userId: 'user-guest',
        name: 'Temp Guest',
        email: 'guest@org.com',
        avatar: 'TG',
        role: 'Guest',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      });

      expect(manager.hasResourcePermission('user-guest', 'org-default', 'canReadOnly')).toBe(true);
      expect(manager.hasResourcePermission('user-guest', 'org-default', 'canManageUsers')).toBe(false);
      expect(manager.hasResourcePermission('user-guest', 'org-default', 'canViewDashboards')).toBe(false);
    });
  });

  describe('Organization Member Repository CRUD', () => {
    it('should seed default members and support retrieving members per organization', () => {
      const allMembers = OrganizationMemberRepository.listMembers();
      expect(allMembers.length).toBe(7);

      const defaultCorpMembers = allMembers.filter((m) => m.organizationId === 'org-default');
      expect(defaultCorpMembers.length).toBe(5);

      const acmeMembers = allMembers.filter((m) => m.organizationId === 'org-acme');
      expect(acmeMembers.length).toBe(2);
    });

    it('should find active members uniquely by user ID and organization ID', () => {
      const found = OrganizationMemberRepository.findMemberByUserAndOrg('user-1', 'org-default');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Marcos Feitosa');
      expect(found?.role).toBe('Owner');
    });
  });

  describe('Plan Restrictions and Limit Enforcement', () => {
    it('should enforce user limits on Starter plan (max 5)', () => {
      const manager = OrganizationMemberManager.getInstance();

      // Create a Starter organization
      OrganizationRepository.create({
        id: 'org-starter-test',
        name: 'Starter Org',
        logo: 'SO',
        plan: 'Starter',
        ownerId: 'user-owner',
        createdAt: new Date().toISOString(),
        status: 'active',
        users: ['user-owner'],
        workers: [],
        plugins: [],
        workflows: [],
        dashboards: [],
        settings: {
          themeColor: '#fff',
          allowedLLMs: [],
          requireMFA: false,
          sessionTimeoutMinutes: 30,
          ipWhitelist: [],
          allowedPluginCategories: [],
          enableAuditLogSymmetricEncryption: false,
        },
        limits: {
          maxUsers: 5,
          maxWorkers: 5,
          maxPlugins: 5,
          maxWorkflows: 5,
          maxMemory: 1024,
          maxMemoryUsageBytes: 1024,
          maxStorage: 1024,
          maxDashboards: 1,
          maxApiRequests: 100,
          maxExecutions: 100,
        },
      });

      // Initially has 1 owner member
      OrganizationMemberRepository.createMember({
        id: 'm-owner',
        organizationId: 'org-starter-test',
        userId: 'user-owner',
        name: 'Starter Owner',
        email: 'owner@starter.com',
        avatar: 'SO',
        role: 'Owner',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      });

      expect(manager.canAddUser('org-starter-test')).toBe(true);

      // Add 4 more members (total 5)
      for (let i = 1; i <= 4; i++) {
        OrganizationMemberRepository.createMember({
          id: `m-direct-${i}`,
          organizationId: 'org-starter-test',
          userId: `user-direct-${i}`,
          name: `User ${i}`,
          email: `user${i}@starter.com`,
          avatar: `U${i}`,
          role: 'Viewer',
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastAccess: new Date().toISOString(),
        });
      }

      // Max reached
      expect(manager.canAddUser('org-starter-test')).toBe(false);

      // Attempting to invite a 6th user must throw an error
      expect(() =>
        manager.inviteMember('org-starter-test', 'extra@starter.com', 'Viewer', 'user-owner')
      ).toThrow('Plan limit reached');
    });

    it('should enforce user limits on Pro plan (max 25)', () => {
      const manager = OrganizationMemberManager.getInstance();

      // Pro plan limits max users to 25. Let's make sure it checks out correctly.
      const orgAcme = OrganizationRepository.find('org-acme');
      expect(orgAcme).toBeDefined();
      expect(orgAcme?.plan).toBe('Pro');

      // Acme has 2 active members. Add 23 more.
      for (let i = 1; i <= 23; i++) {
        OrganizationMemberRepository.createMember({
          id: `m-acme-${i}`,
          organizationId: 'org-acme',
          userId: `user-acme-${i}`,
          name: `Acme User ${i}`,
          email: `user${i}@acme.com`,
          avatar: `A${i}`,
          role: 'Developer',
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastAccess: new Date().toISOString(),
        });
      }

      // Max reached
      expect(manager.canAddUser('org-acme')).toBe(false);
      expect(() =>
        manager.inviteMember('org-acme', 'blocked@acme.com', 'Viewer', 'user-2')
      ).toThrow('Plan limit reached');
    });
  });

  describe('Member Invitation System Flow', () => {
    it('should support sending pending invitations', () => {
      const manager = OrganizationMemberManager.getInstance();

      const invitation = manager.inviteMember('org-default', 'invited@corp.com', 'Developer', 'user-1');
      expect(invitation).toBeDefined();
      expect(invitation.email).toBe('invited@corp.com');
      expect(invitation.role).toBe('Developer');
      expect(invitation.status).toBe('Pending');
    });

    it('should allow accepting pending invitations and creating members', () => {
      const manager = OrganizationMemberManager.getInstance();

      const invitation = manager.inviteMember('org-default', 'accept@corp.com', 'Developer', 'user-1');
      const member = manager.acceptInvitation(invitation.token, 'user-accepted', 'Accept User');

      expect(member).toBeDefined();
      expect(member.userId).toBe('user-accepted');
      expect(member.role).toBe('Developer');
      expect(member.status).toBe('Active');

      // Invitation status must be Accepted
      const updatedInv = OrganizationMemberRepository.findInvitation(invitation.token);
      expect(updatedInv?.status).toBe('Accepted');
    });

    it('should prevent accepting expired invitations', () => {
      const manager = OrganizationMemberManager.getInstance();

      // Create an expired invitation manually
      const expiredInv = OrganizationMemberRepository.createInvitation({
        token: 'exp-tok',
        email: 'expired@corp.com',
        organizationId: 'org-default',
        organizationName: 'Default Corp',
        role: 'Viewer',
        expiration: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });

      expect(() => manager.acceptInvitation(expiredInv.token, 'user-exp', 'Expired User')).toThrow(
        'Invitation has expired'
      );
    });
  });

  describe('Member Lifecycle & Multi-Tenant Security Governance', () => {
    it('should allow Admin/Owner to edit member roles, but block Viewer/Developer editing', () => {
      const manager = OrganizationMemberManager.getInstance();

      // Owner (user-1) can change Dev's (member-4) role to Manager
      const updated = manager.changeMemberRole('member-4', 'Manager', 'user-1');
      expect(updated.role).toBe('Manager');

      // Developer (user-4) cannot edit Owner's role
      expect(() => manager.changeMemberRole('member-1', 'Viewer', 'user-4')).toThrow(
        'SSO Permission Denied'
      );
    });

    it('should suspend and reactivate members correctly, preventing suspended members from execution', () => {
      const manager = OrganizationMemberManager.getInstance();

      // Suspend Dev member-4
      const suspended = manager.suspendMember('member-4', 'user-1');
      expect(suspended.status).toBe('Suspended');

      // Suspended user has NO execution permissions
      expect(manager.hasResourcePermission('user-4', 'org-default', 'canCreateWorkflows')).toBe(false);

      // Reactivate
      const reactivated = manager.reactivateMember('member-4', 'user-1');
      expect(reactivated.status).toBe('Active');
      expect(manager.hasResourcePermission('user-4', 'org-default', 'canCreateWorkflows')).toBe(true);
    });

    it('should enforce critical enterprise security governance constraints', () => {
      const manager = OrganizationMemberManager.getInstance();

      // 1. Owner cannot remove himself
      expect(() => manager.removeMember('member-1', 'user-1')).toThrow(
        'Permission Denied: Owner cannot remove himself.'
      );

      // 2. Admin (user-2) cannot delete Owner (member-1)
      expect(() => manager.removeMember('member-1', 'user-2')).toThrow(
        'SSO Permission Denied: Admin cannot delete Owner.'
      );

      // 3. Admin (user-2) cannot suspend Owner (member-1)
      expect(() => manager.suspendMember('member-1', 'user-2')).toThrow(
        'SSO Permission Denied: Admin cannot suspend Owner.'
      );

      // 4. Admin can delete Developer (member-4)
      const removed = manager.removeMember('member-4', 'user-2');
      expect(removed.status).toBe('Removed');
    });
  });
});
