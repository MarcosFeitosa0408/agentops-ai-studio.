import { OrganizationMember, OrganizationInvitation } from './OrganizationMember';
import { OrganizationMemberRepository } from './OrganizationMemberRepository';
import { OrganizationRole, ROLE_PERMISSIONS } from './OrganizationRoles';
import { OrganizationRepository } from './OrganizationRepository';

export class OrganizationMemberManager {
  private static instance: OrganizationMemberManager;

  private constructor() {}

  public static getInstance(): OrganizationMemberManager {
    if (!OrganizationMemberManager.instance) {
      OrganizationMemberManager.instance = new OrganizationMemberManager();
    }
    return OrganizationMemberManager.instance;
  }

  // Check active members of an organization against its plan limit
  public canAddUser(orgId: string): boolean {
    const org = OrganizationRepository.find(orgId);
    if (!org) return false;

    const activeMembers = OrganizationMemberRepository.listMembers().filter(
      (m) => m.organizationId === orgId && m.status !== 'Removed'
    );

    const pendingInvites = OrganizationMemberRepository.listInvitations().filter(
      (i) => i.organizationId === orgId && i.status === 'Pending'
    );

    const currentTotal = activeMembers.length + pendingInvites.length;

    // Dynamically check against the plan's maxUsers limit instead of hardcoding plan names
    const maxUsers = org.limits?.maxUsers ?? 5;
    return currentTotal < maxUsers;
  }

  // Invite member
  public inviteMember(
    orgId: string,
    email: string,
    role: OrganizationRole,
    callerUserId: string
  ): OrganizationInvitation {
    // 1. Verify caller permission: Admin or Owner can invite users
    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, orgId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can invite new members.');
    }

    // 2. Check plan limit
    if (!this.canAddUser(orgId)) {
      const org = OrganizationRepository.find(orgId);
      throw new Error(`Plan limit reached: Maximum users allowed on plan '${org?.plan}' exceeded.`);
    }

    const org = OrganizationRepository.find(orgId);
    const orgName = org ? org.name : 'Unknown Organization';

    // 3. Create invitation
    const newInvitation: OrganizationInvitation = {
      token: `inv-tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      email,
      organizationId: orgId,
      organizationName: orgName,
      role,
      expiration: new Date(Date.now() + 24 * 3600 * 1000 * 3).toISOString(), // 3 days expiration
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    return OrganizationMemberRepository.createInvitation(newInvitation);
  }

  // Accept invitation
  public acceptInvitation(token: string, userId: string, name: string): OrganizationMember {
    const invitation = OrganizationMemberRepository.findInvitation(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'Pending') {
      throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`);
    }

    // Check expiration
    if (new Date(invitation.expiration).getTime() < Date.now()) {
      OrganizationMemberRepository.updateInvitation(token, { status: 'Expired' });
      throw new Error('Invitation has expired');
    }

    // Accept invitation
    OrganizationMemberRepository.updateInvitation(token, { status: 'Accepted' });

    // Create member
    const newMember: OrganizationMember = {
      id: `member-${Date.now()}`,
      organizationId: invitation.organizationId,
      userId,
      name,
      email: invitation.email,
      avatar: name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      role: invitation.role,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
    };

    const created = OrganizationMemberRepository.createMember(newMember);

    // Synchronize newly added user ID with legacy users array in OrganizationRepository
    const org = OrganizationRepository.find(invitation.organizationId);
    if (org && !org.users.includes(userId)) {
      OrganizationRepository.update(invitation.organizationId, {
        users: [...org.users, userId],
      });
    }

    return created;
  }

  // Create member directly (Admin/Owner bypass for quick testing)
  public createMemberDirectly(
    orgId: string,
    userId: string,
    name: string,
    email: string,
    role: OrganizationRole,
    callerUserId: string
  ): OrganizationMember {
    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, orgId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can create members directly.');
    }

    if (!this.canAddUser(orgId)) {
      const org = OrganizationRepository.find(orgId);
      throw new Error(`Plan limit reached: Maximum users allowed on plan '${org?.plan}' exceeded.`);
    }

    const newMember: OrganizationMember = {
      id: `member-${Date.now()}`,
      organizationId: orgId,
      userId,
      name,
      email,
      avatar: name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      role,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
    };

    const created = OrganizationMemberRepository.createMember(newMember);

    // Synchronize newly added user ID with legacy users array in OrganizationRepository
    const org = OrganizationRepository.find(orgId);
    if (org && !org.users.includes(userId)) {
      OrganizationRepository.update(orgId, {
        users: [...org.users, userId],
      });
    }

    return created;
  }

  // Change member role
  public changeMemberRole(
    memberId: string,
    newRole: OrganizationRole,
    callerUserId: string
  ): OrganizationMember {
    const member = OrganizationMemberRepository.findMember(memberId);
    if (!member) throw new Error('Member not found');

    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, member.organizationId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can change member roles.');
    }

    // Owner cannot change their own role if it is the only Owner
    if (member.userId === callerUserId && member.role === 'Owner' && newRole !== 'Owner') {
      const otherOwners = OrganizationMemberRepository.listMembers().filter(
        (m) => m.organizationId === member.organizationId && m.role === 'Owner' && m.status === 'Active' && m.id !== member.id
      );
      if (otherOwners.length === 0) {
        throw new Error('Permission Denied: Owner cannot change their own role when they are the sole owner of the organization.');
      }
    }

    // Admin cannot change Owner's role
    if (callerMember.role === 'Admin' && member.role === 'Owner') {
      throw new Error('SSO Permission Denied: Admin cannot change Owner roles.');
    }

    return OrganizationMemberRepository.updateMember(memberId, { role: newRole });
  }

  // Suspend member
  public suspendMember(memberId: string, callerUserId: string): OrganizationMember {
    const member = OrganizationMemberRepository.findMember(memberId);
    if (!member) throw new Error('Member not found');

    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, member.organizationId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can suspend members.');
    }

    // Admin cannot suspend Owner
    if (callerMember.role === 'Admin' && member.role === 'Owner') {
      throw new Error('SSO Permission Denied: Admin cannot suspend Owner.');
    }

    // Owner cannot suspend themselves
    if (member.userId === callerUserId) {
      throw new Error('Permission Denied: You cannot suspend yourself.');
    }

    return OrganizationMemberRepository.updateMember(memberId, { status: 'Suspended' });
  }

  // Reactivate member
  public reactivateMember(memberId: string, callerUserId: string): OrganizationMember {
    const member = OrganizationMemberRepository.findMember(memberId);
    if (!member) throw new Error('Member not found');

    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, member.organizationId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can reactivate members.');
    }

    return OrganizationMemberRepository.updateMember(memberId, { status: 'Active' });
  }

  // Remove member
  public removeMember(memberId: string, callerUserId: string): OrganizationMember {
    const member = OrganizationMemberRepository.findMember(memberId);
    if (!member) throw new Error('Member not found');

    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, member.organizationId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can remove members.');
    }

    // Owner cannot remove themselves
    if (member.userId === callerUserId) {
      throw new Error('Permission Denied: Owner cannot remove himself.');
    }

    // Admin cannot remove Owner
    if (callerMember.role === 'Admin' && member.role === 'Owner') {
      throw new Error('SSO Permission Denied: Admin cannot delete Owner.');
    }

    return OrganizationMemberRepository.updateMember(memberId, { status: 'Removed' });
  }

  // Cancel invitation
  public cancelInvitation(token: string, callerUserId: string): OrganizationInvitation {
    const invitation = OrganizationMemberRepository.findInvitation(token);
    if (!invitation) throw new Error('Invitation not found');

    const callerMember = OrganizationMemberRepository.findMemberByUserAndOrg(callerUserId, invitation.organizationId);
    if (!callerMember || (callerMember.role !== 'Admin' && callerMember.role !== 'Owner')) {
      throw new Error('SSO Permission Denied: Only Admin or Owner can cancel invitations.');
    }

    return OrganizationMemberRepository.updateInvitation(token, { status: 'Cancelled' });
  }

  // Verify permission for resource execution based on user role inside organization
  public hasResourcePermission(
    userId: string,
    orgId: string,
    permission: keyof typeof ROLE_PERMISSIONS[OrganizationRole]
  ): boolean {
    const member = OrganizationMemberRepository.findMemberByUserAndOrg(userId, orgId);
    if (!member || member.status !== 'Active') return false;

    return ROLE_PERMISSIONS[member.role]?.[permission] || false;
  }
}
export default OrganizationMemberManager;
