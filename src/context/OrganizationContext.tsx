'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '../organizations/Organization';
import { OrganizationRepository } from '../organizations/OrganizationRepository';
import { OrganizationManager } from '../organizations/OrganizationManager';
import { OrganizationPlanType, PLAN_LIMITS } from '../organizations/OrganizationPlans';
import { DEFAULT_SETTINGS } from '../organizations/OrganizationSettings';
import { OrganizationMember, OrganizationInvitation } from '../organizations/OrganizationMember';
import { OrganizationRole } from '../organizations/OrganizationRoles';
import { OrganizationMemberRepository } from '../organizations/OrganizationMemberRepository';
import { OrganizationMemberManager } from '../organizations/OrganizationMemberManager';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  isHydrating: boolean;
  switchOrganization: (id: string) => void;
  createOrganization: (name: string, logo: string, plan: OrganizationPlanType) => Organization;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  deactivateOrganization: (id: string) => void;

  // Membership & Invitations State
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
  activeMembers: OrganizationMember[];
  activeInvitations: OrganizationInvitation[];

  // Membership Actions
  inviteMember: (email: string, role: OrganizationRole) => void;
  acceptInvitation: (token: string, userId: string, name: string) => void;
  cancelInvitation: (token: string) => void;
  createMemberDirectly: (userId: string, name: string, email: string, role: OrganizationRole) => void;
  changeMemberRole: (memberId: string, newRole: OrganizationRole) => void;
  suspendMember: (memberId: string) => void;
  reactivateMember: (memberId: string) => void;
  removeMember: (memberId: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Membership states
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);

  // Load from localStorage/Repository
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const list = OrganizationRepository.list();
        setOrganizations(list);
        const active = OrganizationManager.getInstance().getActiveOrganization();
        setActiveOrganization(active);

        // Load members & invitations
        setMembers(OrganizationMemberRepository.listMembers());
        setInvitations(OrganizationMemberRepository.listInvitations());
      } catch (e) {
        console.error('Error hydrating organization context:', e);
      } finally {
        setIsHydrating(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const switchOrganization = (id: string) => {
    try {
      OrganizationManager.getInstance().switchOrganization(id);
      const active = OrganizationManager.getInstance().getActiveOrganization();
      setActiveOrganization(active);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(msg);
      throw e;
    }
  };

  const createOrganization = (name: string, logo: string, plan: OrganizationPlanType): Organization => {
    const planLimits = PLAN_LIMITS[plan];
    const newOrgId = `org-${Date.now()}`;
    const newOrg: Organization = {
      id: newOrgId,
      name,
      logo: logo || name.slice(0, 2).toUpperCase(),
      plan,
      ownerId: currentUser?.id || 'user-1',
      createdAt: new Date().toISOString(),
      status: 'active',
      users: [currentUser?.id || 'user-1'], // Initially include current user as member
      workers: [],
      plugins: [],
      workflows: [],
      dashboards: [],
      settings: { ...DEFAULT_SETTINGS },
      limits: planLimits,
    };

    const created = OrganizationRepository.create(newOrg);
    setOrganizations(OrganizationRepository.list());

    // Create corresponding Owner OrganizationMember
    try {
      const ownerMember: OrganizationMember = {
        id: `member-owner-${Date.now()}`,
        organizationId: newOrgId,
        userId: currentUser?.id || 'user-1',
        name: currentUser?.name || 'Owner',
        email: currentUser?.email || 'owner@org.com',
        avatar: (currentUser?.name || 'Owner')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        role: 'Owner',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      };
      OrganizationMemberRepository.createMember(ownerMember);
      setMembers(OrganizationMemberRepository.listMembers());
    } catch (err) {
      console.error('Error creating owner member for new organization:', err);
    }

    return created;
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    OrganizationRepository.update(id, updates);
    setOrganizations(OrganizationRepository.list());
    if (activeOrganization?.id === id) {
      setActiveOrganization(OrganizationManager.getInstance().getActiveOrganization());
    }
  };

  const deleteOrganization = (id: string) => {
    if (id === 'org-default') {
      throw new Error('Cannot delete default organization');
    }
    const success = OrganizationRepository.delete(id);
    if (success) {
      const updatedList = OrganizationRepository.list();
      setOrganizations(updatedList);
      if (activeOrganization?.id === id) {
        OrganizationManager.getInstance().switchOrganization('org-default');
        setActiveOrganization(OrganizationManager.getInstance().getActiveOrganization());
      }
    }
  };

  const deactivateOrganization = (id: string) => {
    if (id === 'org-default') {
      throw new Error('Cannot deactivate default organization');
    }
    updateOrganization(id, { status: 'inactive' });
  };

  // Membership Actions
  const inviteMember = (email: string, role: OrganizationRole) => {
    if (!activeOrganization) throw new Error('No active organization');
    const callerId = currentUser?.id || 'user-1';

    OrganizationMemberManager.getInstance().inviteMember(
      activeOrganization.id,
      email,
      role,
      callerId
    );

    setInvitations(OrganizationMemberRepository.listInvitations());
  };

  const acceptInvitation = (token: string, userId: string, name: string) => {
    OrganizationMemberManager.getInstance().acceptInvitation(token, userId, name);
    setMembers(OrganizationMemberRepository.listMembers());
    setInvitations(OrganizationMemberRepository.listInvitations());
  };

  const cancelInvitation = (token: string) => {
    const callerId = currentUser?.id || 'user-1';
    OrganizationMemberManager.getInstance().cancelInvitation(token, callerId);
    setInvitations(OrganizationMemberRepository.listInvitations());
  };

  const createMemberDirectly = (
    userId: string,
    name: string,
    email: string,
    role: OrganizationRole
  ) => {
    if (!activeOrganization) throw new Error('No active organization');
    const callerId = currentUser?.id || 'user-1';

    OrganizationMemberManager.getInstance().createMemberDirectly(
      activeOrganization.id,
      userId,
      name,
      email,
      role,
      callerId
    );

    setMembers(OrganizationMemberRepository.listMembers());
  };

  const changeMemberRole = (memberId: string, newRole: OrganizationRole) => {
    const callerId = currentUser?.id || 'user-1';
    OrganizationMemberManager.getInstance().changeMemberRole(memberId, newRole, callerId);
    setMembers(OrganizationMemberRepository.listMembers());
  };

  const suspendMember = (memberId: string) => {
    const callerId = currentUser?.id || 'user-1';
    OrganizationMemberManager.getInstance().suspendMember(memberId, callerId);
    setMembers(OrganizationMemberRepository.listMembers());
  };

  const reactivateMember = (memberId: string) => {
    const callerId = currentUser?.id || 'user-1';
    OrganizationMemberManager.getInstance().reactivateMember(memberId, callerId);
    setMembers(OrganizationMemberRepository.listMembers());
  };

  const removeMember = (memberId: string) => {
    const callerId = currentUser?.id || 'user-1';
    OrganizationMemberManager.getInstance().removeMember(memberId, callerId);
    setMembers(OrganizationMemberRepository.listMembers());
  };

  // Filtered members & invitations
  const activeMembers = members.filter(
    (m) => activeOrganization && m.organizationId === activeOrganization.id && m.status !== 'Removed'
  );

  const activeInvitations = invitations.filter(
    (i) => activeOrganization && i.organizationId === activeOrganization.id
  );

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        isHydrating,
        switchOrganization,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        deactivateOrganization,

        // Membership states
        members,
        invitations,
        activeMembers,
        activeInvitations,

        // Membership Actions
        inviteMember,
        acceptInvitation,
        cancelInvitation,
        createMemberDirectly,
        changeMemberRole,
        suspendMember,
        reactivateMember,
        removeMember,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
export default OrganizationContext;
