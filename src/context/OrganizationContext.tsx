'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from '../organizations/Organization';
import { OrganizationRepository } from '../organizations/OrganizationRepository';
import { OrganizationManager } from '../organizations/OrganizationManager';
import { OrganizationPlanType, PLAN_LIMITS } from '../organizations/OrganizationPlans';
import { DEFAULT_SETTINGS } from '../organizations/OrganizationSettings';

interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  isHydrating: boolean;
  switchOrganization: (id: string) => void;
  createOrganization: (name: string, logo: string, plan: OrganizationPlanType) => Organization;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  deactivateOrganization: (id: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Load from localStorage/Repository
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const list = OrganizationRepository.list();
        setOrganizations(list);
        const active = OrganizationManager.getInstance().getActiveOrganization();
        setActiveOrganization(active);
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
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name,
      logo: logo || name.slice(0, 2).toUpperCase(),
      plan,
      ownerId: 'user-1', // Default owner
      createdAt: new Date().toISOString(),
      status: 'active',
      users: ['user-1'], // Initially include user-1 as member
      workers: [],
      plugins: [],
      workflows: [],
      dashboards: [],
      settings: { ...DEFAULT_SETTINGS },
      limits: planLimits,
    };

    const created = OrganizationRepository.create(newOrg);
    setOrganizations(OrganizationRepository.list());
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
