import { OrganizationRole } from './OrganizationRoles';

export type OrganizationMemberStatus = 'Active' | 'Pending' | 'Suspended' | 'Removed';

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string; // references authenticated user ID
  name: string;
  email: string;
  avatar: string;
  role: OrganizationRole;
  status: OrganizationMemberStatus;
  createdAt: string;
  lastAccess: string;
}

export type OrganizationInvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';

export interface OrganizationInvitation {
  token: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: OrganizationRole;
  expiration: string; // ISO string date
  status: OrganizationInvitationStatus;
  createdAt: string;
}
